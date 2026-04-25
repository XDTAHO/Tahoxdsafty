// Cloudflare Pages Functions 的標準寫法，匯出 onRequest 函數
export async function onRequest(context) {
  // 從 context 中解構出 request (請求) 與 env (環境變數/KV綁定)
  const { request, env } = context;

  // 設定 CORS 標頭 (允許 GAS 後端打 API 過來)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // [前端] GET 請求：瞬間回傳表單所有設定與題目
  if (request.method === "GET") {
    // 透過 env.KV_BINDING 讀取您綁定的 KV 空間
    const data = await env.KV_BINDING.get("form_payload");
    return new Response(data || "{}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // [後端 GAS] POST 請求：接收試算表發佈的新設定
  if (request.method === "POST") {
    const auth = request.headers.get("Authorization");
    if (auth !== "Bearer MySuperSecretKey123!") {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const body = await request.text();
    await env.KV_BINDING.put("form_payload", body);
    return new Response("發佈成功！", { headers: corsHeaders });
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}
