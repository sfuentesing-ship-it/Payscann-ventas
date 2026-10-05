export async function onRequest(context) {
  const { request, env } = context;
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  try {
    if (env && env.NAYAX_KV) {
      const v = await env.NAYAX_KV.get('efectivo');
      if (v) {
        return new Response(v, { status: 200, headers: cors });
      }
    }
  } catch (e) { /* sin KV configurado */ }
  return new Response(JSON.stringify({ ok: true, demo: true, fuente: 'sin datos en vivo aun' }), { status: 200, headers: cors });
}
