export async function onRequest() {
  return new Response('部署已成功', {
    headers: { 'Content-Type': 'text/plain' },
  });
}
