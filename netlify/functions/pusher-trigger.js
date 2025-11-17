const Pusher = require("pusher");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { text, user, id, ts } = body;
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    return { statusCode: 500, body: "Pusher credentials not configured" };
  }

  try {
    // attempt to persist the message via the messages function so the record
    // is available to clients who later fetch the persisted list. Use SITE_URL
    // or URL env var when available, otherwise try localhost dev port.
    const siteBase = process.env.SITE_URL || process.env.URL || `http://127.0.0.1:${process.env.PORT || 8888}`;
    try {
      await fetch(`${siteBase}/.netlify/functions/messages?op=add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text, user, ts }),
      });
    } catch (e) {
      // ignore persistence failures — we'll still trigger Pusher
      console.error('persist message failed', e && e.message);
    }

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger('ai-chat', 'message', { id, text, user, ts: ts || Date.now() });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('pusher error', err);
    return { statusCode: 500, body: String(err) };
  }
};
