/* SigmaPro — servicio sin conexión.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Solo actúa cuando la app se sirve por http o https (por ejemplo, publicada en una página web): la primera visita
   guarda la app completa en el navegador y desde entonces abre y calcula sin internet. Con doble clic (file://) no se
   instala ni hace falta: todo ya está en el equipo.

   · Al instalarse, lee index.html y guarda cada script, hoja de estilo e imagen que nombra, más los que la app carga
     después (el estudio de figuras y el navegador traen su propia hoja de estilo).
   · La página se pide primero a la red (para que una versión nueva llegue en cuanto hay conexión) y, si no hay, se
     sirve la guardada. Lo demás se sirve de lo guardado y se actualiza en segundo plano.
   · El motor R propio (motor-r/, si se publicó junto a la app): sus archivos no cambian dentro de una versión de
     webR; se guardan la primera vez que se usan, en un almacén aparte que sobrevive a las versiones de la app, y desde
     entonces se sirven de ahí sin volver a la red. webR comprueba con HEAD que exista un archivo: se responde con la
     copia guardada (y, con red, se guarda esa copia para la próxima vez sin conexión).
   · Solo maneja peticiones GET (y HEAD del motor) del mismo origen: nunca guarda ni envía datos de quien usa la app. */
'use strict';
const VERSION = '0.3.3-2026-10-04';
const CACHE = 'sigmapro-' + VERSION;
const MOTOR = 'sigmapro-motor-r-0.6.0';
const EXTRAS = ['./', './index.html', './css/labg-figure-studio.css', './css/labg-navigator.css', './manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
    const nombrados = [...html.matchAll(/(?:src|href)="([^"#:?]+\.(?:js|css|webmanifest|png|svg))"/g)].map(m => './' + m[1].replace(/^\.\//, ''));
    const lista = [...new Set(EXTRAS.concat(nombrados))];
    /* uno por uno: un archivo que falte no impide guardar los demás */
    await Promise.all(lista.map(u => fetch(u, { cache: 'no-store' }).then(r => (r.ok ? cache.put(u, r) : null)).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('sigmapro-') && k !== CACHE && k !== MOTOR) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const q = e.request, url = new URL(q.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/motor-r/') && (q.method === 'GET' || q.method === 'HEAD')) {
    e.respondWith((async () => {
      const c = await caches.open(MOTOR), clave = new Request(url.href), guardada = await c.match(clave);
      if (guardada) return q.method === 'HEAD' ? new Response(null, { status: guardada.status, headers: guardada.headers }) : guardada;
      if (q.method === 'HEAD') {
        e.waitUntil(fetch(clave).then(r => (r.ok ? c.put(clave, r) : null)).catch(() => null));
        return fetch(q);
      }
      const r = await fetch(q);
      if (r.ok && r.type === 'basic') await c.put(clave, r.clone());
      return r;
    })());
    return;
  }
  if (q.method !== 'GET') return;
  if (q.mode === 'navigate') {
    /* la página: primero la red; sin red, la guardada */
    e.respondWith((async () => {
      try {
        const r = await fetch(q);
        if (r.ok) { const c = await caches.open(CACHE); c.put('./index.html', r.clone()); }
        return r;
      } catch (err) {
        const c = await caches.open(CACHE);
        return (await c.match(q, { ignoreSearch: true })) || (await c.match('./index.html')) || Response.error();
      }
    })());
    return;
  }
  /* lo demás: lo guardado al instante y la versión de la red para la próxima vez */
  const red = fetch(q).then(async r => {
    if (r.ok && r.type === 'basic') await (await caches.open(CACHE)).put(q, r.clone());
    return r;
  }).catch(() => null);
  e.waitUntil(red);
  e.respondWith((async () => {
    const guardada = await (await caches.open(CACHE)).match(q, { ignoreSearch: true });
    return guardada || (await red) || Response.error();
  })());
});
