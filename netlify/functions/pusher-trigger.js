const Pusher = require("pusher");

exports.handler = async function (event) {
  // Basic CORS support for preflight and browser requests
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { text, user, id, ts } = body;
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    console.error("pusher-trigger: missing server-side env vars");
    return { statusCode: 500, headers, body: "Pusher credentials not configured" };
  }

  try {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger("ai-chat", "message", { id, text, user, ts: ts || Date.now() });

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("pusher error", err);
    // Avoid returning raw error objects that may contain sensitive info
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Pusher request failed" }) };
  }
};
