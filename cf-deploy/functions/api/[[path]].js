export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
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
      'Access-Control-Allow-Origin': '*'
    }
  });
}
