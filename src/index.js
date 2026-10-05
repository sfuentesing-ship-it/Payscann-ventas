// Worker del dashboard PayScan - Vending Store
// Sirve el dashboard (assets estáticos) y hace de puente con la API de PayScan
// y con los datos de efectivo de Nayax (guardados en KV).

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    // ---------- Efectivo (Nayax) ----------
    if (url.pathname === '/api/nayax/efectivo') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
      }
      try {
        if (env && env.NAYAX_KV) {
          const v = await env.NAYAX_KV.get('efectivo');
          if (v) return new Response(v, { status: 200, headers: cors });
        }
      } catch (e) { /* sin KV */ }
      return new Response(
        JSON.stringify({ ok: true, demo: true, fuente: 'sin datos en vivo aun' }),
        { status: 200, headers: cors }
      );
    }

    if (url.pathname === '/api/nayax/save') {
      const c = {
        ...cors,
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      };
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: c });
      }
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ ok: false, error: 'Usa POST' }), { status: 405, headers: c });
      }
      const body = await request.text();
      if (body.length > 2000000) {
        return new Response(JSON.stringify({ ok: false, error: 'muy grande' }), { status: 413, headers: c });
      }
      try {
        if (env && env.NAYAX_KV) {
          await env.NAYAX_KV.put('efectivo', body);
          return new Response(JSON.stringify({ ok: true, guardado: body.length }), { status: 200, headers: c });
        }
        return new Response(JSON.stringify({ ok: false, error: 'KV no configurado' }), { status: 200, headers: c });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: c });
      }
    }

    // ---------- Proxy hacia la API de PayScan ----------
    if (url.pathname.startsWith('/api/')) {
      const target = 'https://admin.payscan.cl' + url.pathname + url.search;
      const headers = new Headers();
      const auth = request.headers.get('Authorization');
      if (auth) headers.set('Authorization', auth);
      const method = request.method;
      const init = { method, headers };
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        headers.set('Content-Type', 'application/json');
        init.body = await request.text();
      }
      const resp = await fetch(target, init);
      const body = await resp.arrayBuffer();
      return new Response(body, {
        status: resp.status,
        headers: {
          'Content-Type': resp.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // ---------- Dashboard (archivos estáticos) ----------
    return env.ASSETS.fetch(request);
  },
};
