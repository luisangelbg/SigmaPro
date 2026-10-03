// SigmaPro — cómo abren las pruebas el navegador sin ventana (Edge o Chrome).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Un perfil nuevo de Edge puede iniciar sesión solo con la cuenta del sistema, sincronizar e instalar extensiones;
// la pestaña de bienvenida de una extensión quedaba al frente y la página de la prueba pasaba a «oculta», donde
// requestAnimationFrame no corre y las pruebas largas se quedaban esperando. Por eso: sin extensiones, sin
// sincronizar ni red de fondo, y la página de la prueba en su propia ventana.

export const BANDERAS = ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--disable-component-extensions-with-background-pages', '--disable-sync', '--disable-background-networking',
  '--disable-features=msImplicitSignin,msEdgeSyncConsent'];

/** Abre una página en blanco en una ventana propia y devuelve su descripción ({ id, webSocketDebuggerUrl }), o null
    si el navegador todavía no responde en ese puerto. */
export async function paginaPropia(puerto) {
  let v;
  try { v = await (await fetch('http://127.0.0.1:' + puerto + '/json/version')).json(); } catch { return null; }
  const ws = new WebSocket(v.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  const id = await new Promise(ok => {
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id === 1) ok(m.result && m.result.targetId); };
    ws.send(JSON.stringify({ id: 1, method: 'Target.createTarget', params: { url: 'about:blank', newWindow: true } }));
  });
  ws.close();
  const lista = await (await fetch('http://127.0.0.1:' + puerto + '/json')).json();
  return lista.find(t => t.id === id) || null;
}
