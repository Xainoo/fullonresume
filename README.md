FullOnResume — Single-repo Portfolio Workspace

# FullOnResume — Single-repo Portfolio Workspace

This repo is a Vite + React + TypeScript portfolio/resume/demo web app with a small set of Netlify Functions and client features (finance dashboard, realtime chat, image classifier). The following instructions explain how to prepare your machine, run the project locally, configure environment variables, and verify the finance conversion behavior.

## Prerequisites

- Node.js (recommended LTS — e.g. 18.x or 20.x). Download: https://nodejs.org/
- npm (bundled with Node.js) or Yarn/Pnpm if you prefer an alternative package manager.
- (Optional) Netlify CLI if you want to run serverless functions locally: `npm install -g netlify-cli`.

On Windows (PowerShell) example:

```powershell
# install dependencies
npm install

# run dev server
npm run dev
```

## Project structure (high level)

- `src/` — React + TypeScript frontend
- `src/components/` — UI components (Finance dashboard, Transactions, Charts, AI playground)
- `src/services/` — small client services, e.g. `rates.ts` and `finance.ts`
- `netlify/functions/` — Netlify Functions used by the demo (Pusher trigger, finance persistence endpoints when authenticated)
- `public/` — static assets

## How the Finance feature works (important)

- Transactions are recorded with an explicit `currency` field and the UI displays each transaction in its original currency.
- The app uses a `displayCurrency` setting (default: EUR) to show aggregated totals (Balance, MonthlySummary, Budget) converted into the selected currency using exchange rates.
- Rates are fetched from an external service with a local default fallback. The dashboard centralizes conversions so charts/totals are stable when the display currency changes.

Important: recorded transactions should keep their original currency across page reloads. If you see transactions changing currency on refresh, it means the stored transaction objects are missing the `currency` field in your persistence layer (localStorage or server). The app now preserves currencies on save and does not overwrite fetched records on mount.

## Environment variables

- Client (Vite): put any client-only preview values in `.env` (keys must start with `VITE_`). These are optional.
- Server (Netlify site env): if you deploy and want realtime chat, add these server variables in Netlify UI:
  - `PUSHER_APP_ID`
  - `PUSHER_KEY`
  - `PUSHER_SECRET`
  - `PUSHER_CLUSTER`

Do NOT commit server secrets to your repo.

## Common scripts

- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build locally (after `npm run build`)

## Running with Netlify Functions locally

1. Install `netlify-cli` globally: `npm install -g netlify-cli`
2. Run: `netlify dev` — this will run Vite + your functions locally and expose function endpoints at `/.netlify/functions/*`.

## Quick checklist to run locally

1. Clone the repo and `cd` into the project folder.
2. `npm install`
3. (Optional) create `.env` from `.env.example` to set any Vite preview variables.
4. `npm run dev` (or `netlify dev` if you want local functions)
5. Open the app in your browser (default `http://localhost:5173` for Vite).

## Debug panel & diagnosing rates

- The Finance Dashboard includes a temporary debug panel (toggle "Show debug") that prints the current rates object, per-transaction per-unit rate (`1 ORIG → X DISPLAY`) and the converted totals. Use this to inspect values while switching the `displayCurrency` selector.
- If the debug panel shows `(no rate)` or `1 (unknown) → USD 1.000000`, either the transaction currency is missing or the rates object is incomplete. You can open browser devtools → Application → Local Storage to inspect `finance_transactions_v1` and verify each transaction has a `currency` value.

## Deployment (Netlify)

- Deploy the repository to Netlify (connect via Git) and set the server-side environment variables described above. Netlify will build the app and publish the site. The Netlify Functions under `netlify/functions/` will be deployed automatically.

## Troubleshooting

- "Realtime disabled (no Pusher key)": check local `.env` preview keys or Netlify env vars.
- Transactions appear in EUR after refresh: inspect persisted data in localStorage or your server responses — the persisted records must include a `currency` property. The app will not overwrite persisted currencies on load.
- Rates unavailable message: the app will show a rates-unavailable notice only when it lacks any prior rates/fallbacks. Network failures will keep the last-known rates so the UI remains functional.

## Development notes

- Default display currency for aggregated views is now EUR.
- Supported currencies in the demo: EUR, USD, PLN, DKK, GBP (GBP included).
- Conversion helper is in `src/services/rates.ts`. It falls back to built-in defaults when the remote fetch fails.

## Useful commands

```powershell
# type-check only
npx tsc --noEmit

# full build
npm ci
npm run build

# run dev server with local Netlify functions (optional)
npm install -g netlify-cli
netlify dev
```

If you'd like, I can add a small migration script to fix existing localStorage transactions that don't have a `currency` property (set them to EUR or ask for a prompt on first run).

---

If anything here is out of date for your workflow, tell me which section you'd like tightened (for example: exact Node version, preferred package manager, or adding CI commands) and I'll update the README accordingly.
