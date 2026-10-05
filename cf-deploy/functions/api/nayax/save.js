export async function onRequest(context) {
  const { request, env } = context;
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Usa POST' }), { status: 405, headers: cors });
  }
  const body = await request.text();
  if (body.length > 2000000) {
    return new Response(JSON.stringify({ ok: false, error: 'muy grande' }), { status: 413, headers: cors });
  }
  try {
    if (env && env.NAYAX_KV) {
      await env.NAYAX_KV.put('efectivo', body);
      return new Response(JSON.stringify({ ok: true, guardado: body.length }), { status: 200, headers: cors });
    }
    return new Response(JSON.stringify({ ok: false, error: 'KV no configurado' }), { status: 200, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: cors });
  }
}
