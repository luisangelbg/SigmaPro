/* SigmaPro — recorrido de XML sin construir árbol (estilo SAX).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Una hoja de cálculo con 100 000 filas trae millones de etiquetas: construir un árbol
   las tendría todas en memoria. Este recorredor avisa cada apertura, cierre y texto, y
   el lector se queda solo con lo que necesita. No depende del navegador (corre en hilos
   de trabajo y en node).

     SP.xml.recorrer(texto, { abre(nombre, atributos, vacia), cierra(nombre), texto(t) })
     SP.xml.atributos('a="1" b=\'x\'') → { a: '1', b: 'x' } */
SP.definir('xml', function (SP) {
  'use strict';

  const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  function decodificar(s) {
    if (s.indexOf('&') < 0) return s;
    return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, e) => {
      if (e[0] === '#') {
        const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
      }
      return Object.prototype.hasOwnProperty.call(ENTIDADES, e) ? ENTIDADES[e] : m;
    });
  }

  function atributos(s) {
    const out = {};
    const re = /([^\s=\/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m;
    while ((m = re.exec(s))) out[m[1]] = decodificar(m[3] !== undefined ? m[3] : m[4]);
    return out;
  }

  /** Posición del '>' que cierra la etiqueta que empieza en i, respetando comillas. */
  function finDeEtiqueta(t, i) {
    let q = null;
    for (let k = i; k < t.length; k++) {
      const c = t[k];
      if (q) { if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === '>') return k;
    }
    return -1;
  }

  function recorrer(t, h) {
    const abre = h.abre || (() => {}), cierra = h.cierra || (() => {}), texto = h.texto || null;
    let i = 0;
    const n = t.length;
    while (i < n) {
      const lt = t.indexOf('<', i);
      if (lt < 0) { if (texto) { const s = t.slice(i); if (s.trim()) texto(decodificar(s)); } break; }
      if (lt > i && texto) texto(decodificar(t.slice(i, lt)));
      const c1 = t[lt + 1];
      if (c1 === '!') {
        if (t.startsWith('<!--', lt)) { const f = t.indexOf('-->', lt + 4); i = f < 0 ? n : f + 3; continue; }
        if (t.startsWith('<![CDATA[', lt)) {
          const f = t.indexOf(']]>', lt + 9);
          if (texto) texto(t.slice(lt + 9, f < 0 ? n : f));
          i = f < 0 ? n : f + 3; continue;
        }
        const f = t.indexOf('>', lt); i = f < 0 ? n : f + 1; continue;
      }
      if (c1 === '?') { const f = t.indexOf('?>', lt); i = f < 0 ? n : f + 2; continue; }
      const gt = finDeEtiqueta(t, lt + 1);
      if (gt < 0) break;
      if (c1 === '/') { cierra(t.slice(lt + 2, gt).trim()); i = gt + 1; continue; }
      let cuerpo = t.slice(lt + 1, gt);
      const vacia = cuerpo.endsWith('/');
      if (vacia) cuerpo = cuerpo.slice(0, -1);
      const sp = cuerpo.search(/\s/);
      const nombre = sp < 0 ? cuerpo : cuerpo.slice(0, sp);
      abre(nombre, sp < 0 ? {} : atributos(cuerpo.slice(sp + 1)), vacia);
      if (vacia) cierra(nombre);
      i = gt + 1;
    }
  }

  /** Árbol pequeño (para partes chicas del libro: libro, relaciones, estilos). */
  function arbol(t) {
    const raiz = { nombre: '#raiz', atr: {}, hijos: [], texto: '' };
    const pila = [raiz];
    recorrer(t, {
      abre(nombre, atr) { const nodo = { nombre, atr, hijos: [], texto: '' }; pila[pila.length - 1].hijos.push(nodo); pila.push(nodo); },
      cierra() { if (pila.length > 1) pila.pop(); },
      texto(s) { pila[pila.length - 1].texto += s; },
    });
    return raiz;
  }
  /** Todos los descendientes con ese nombre (completo, o local si se da sin prefijo). */
  function buscar(nodo, nombre, out) {
    out = out || [];
    for (const h of nodo.hijos) {
      const local = h.nombre.indexOf(':') >= 0 ? h.nombre.slice(h.nombre.indexOf(':') + 1) : h.nombre;
      if (h.nombre === nombre || local === nombre) out.push(h);
      buscar(h, nombre, out);
    }
    return out;
  }

  SP.xml = { recorrer, atributos, decodificar, arbol, buscar };
});
