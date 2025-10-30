FullOnResume — Single-repo Portfolio Workspace

# FullOnResume — Single-repo Portfolio Workspace

This repository is a Vite + React + TypeScript resume/portfolio demo that includes small serverless functions (Netlify Functions) for secure API access (weather, exchange rates, investment analysis). The README below explains how to get the project running locally, how to configure environment variables, how to test the exchange rates function used by the Expense Tracker, and how to deploy.

---

1. Install dependencies

```powershell
npm install
```

2. Start dev server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

## Files / Structure

- `src/main.tsx` — app entry, mounts `<App />`
- `src/App.tsx` — routing (BrowserRouter + Routes)
- `src/components/Layout.tsx` — top-level layout + navigation
- `src/pages/*` — Home, Portfolio, Projects, ProjectDetail
- `src/components/ListGroup.tsx` — existing component (can be removed later)

## Browser-only Animal Classifier and Realtime Chat

This project includes two small interactive features that work well on Netlify Free:

- Animal classifier (browser-only): The classifier uses TensorFlow.js and MobileNet in the browser. Model loading is deferred (dynamic import) so it only downloads when you use the classifier. The component supports uploading an image or using the webcam for live classification — no server-side inference required.
- Realtime chat (Pusher + Netlify Functions): A small Netlify Function (`netlify/functions/pusher-trigger.js`) triggers Pusher server-side to broadcast chat messages. The client reads `VITE_PUSHER_KEY` to subscribe to the `ai-chat` channel. If Pusher env vars are not provided during local development, the chat falls back to a local-only client-side mode so the UI remains usable.

Deployment and env notes

- Client-side envs (for local dev with Vite): add Vite-prefixed variables to `.env` or `.env.local` like `VITE_PUSHER_KEY` and `VITE_PUSHER_CLUSTER`. These are read by the client.
- Server-side envs for Netlify Functions: configure `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER` in the Netlify site settings (these are not prefixed with `VITE_`). The function `pusher-trigger.js` uses these server-side envs to call Pusher.
- For the classifier: no server envs required. The browser downloads the TensorFlow.js model directly from the CDN when first used.

Local testing checklist

1. Copy `.env.example` to `.env` and fill in any keys you want to test.
2. Start the dev server:

```powershell
npm run dev
```

3. Open the app in the browser. Use the Animal classifier: upload an image or click "Use camera" and allow camera permissions. Use the Realtime chat: if you filled Pusher keys and deployed Netlify function, you'll get full realtime behavior; otherwise the chat will operate locally for preview.

Security note: Keep server-side Pusher secrets in Netlify's environment settings, not in a committed `.env` file.

Netlify + Pusher quick deploy guide

1. Create a free Pusher app at https://dashboard.pusher.com and note the App ID, Key, Secret and Cluster.

2. In your Netlify site dashboard, go to Site settings → Build & deploy → Environment and add the following server-side variables (these must be set in Netlify UI):

   - `PUSHER_APP_ID` = <your app id>
   - `PUSHER_KEY` = <your app key>
   - `PUSHER_SECRET` = <your app secret>
   - `PUSHER_CLUSTER` = <your app cluster> (e.g. `eu`)

   These env vars are used by `netlify/functions/pusher-trigger.js` when the function runs on Netlify.

3. (Optional) For local client preview, add Vite-prefixed client values in your local `.env` file (these are safe for preview but avoid committing secrets):

   - `VITE_PUSHER_KEY` = same as `PUSHER_KEY`
   - `VITE_PUSHER_CLUSTER` = same as `PUSHER_CLUSTER`

4. Deploy your site to Netlify. The Netlify Function `pusher-trigger` will be deployed from `netlify/functions/pusher-trigger.js` automatically. Once deployed, the client can POST to `/.netlify/functions/pusher-trigger` to broadcast messages to the `ai-chat` channel.

5. Testing the function (deployed site):

   - From client: open the app, go to AI playground and send a chat message. Other connected clients should receive it in realtime.
   - From server/API: you can curl the function endpoint (replace with your site URL):

```powershell
curl -X POST "https://your-site.netlify.app/.netlify/functions/pusher-trigger" -H "Content-Type: application/json" -d '{"text":"hello","user":"tester"}'
```

    The function will respond with a JSON success or error message.

Troubleshooting

- If the client shows "Realtime disabled (no Pusher key)", ensure `VITE_PUSHER_KEY` is set locally or the site has the correct key after deploy.
- If the Netlify function returns 500, check Netlify function logs (Netlify dashboard) for missing or incorrect server-side Pusher credentials.
