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
