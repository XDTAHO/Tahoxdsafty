// Cloudflare Pages Functions
export async function onRequest(context) {
  const { request, env } = context;

  // 【修復 1】加入 Cache-Control 防快取標頭，確保手機永遠抓取最新題目
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === "GET") {
    const data = await env.KV_BINDING.get("form_payload");
    return new Response(data || "{}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST") {
    const auth = request.headers.get("Authorization");
    
    if (auth !== `Bearer ${env.CF_API_KEY}`) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const body = await request.text();
    await env.KV_BINDING.put("form_payload", body);
    return new Response("發佈成功！", { headers: corsHeaders });
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}
