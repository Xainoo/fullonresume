FullOnResume — Single-repo Portfolio Workspace

This repository is a single, connected React + Vite workspace intended to host a main landing page, a Portfolio/CV page, and Projects with per-project detail pages. The project uses Bootstrap for basic styling and react-router-dom for client-side routing.

## Quick start

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

## Git & GitHub guide (recommended workflow)

1. Initialize a git repository (if not already):

```powershell
git init
git add .
git commit -m "Initial commit: scaffold project"
```

2. Create a repository on GitHub (via website) and copy the repo URL (HTTPS or SSH). Then link and push:

```powershell
# replace <URL> with the GitHub repository URL
git remote add origin <URL>
git branch -M main
git push -u origin main
```

3. Ongoing work (small, focused commits recommended):

```powershell
# 1) make changes
# 2) stage relevant files
git add src/pages/* src/components/* src/App.tsx package.json README.md

# 3) commit with a clear message
git commit -m "Add routing and pages: Home, Portfolio, Projects"

# 4) push
git push
```

When to create branches:

- Use feature branches for larger changes: `git checkout -b feature/add-contact-page`
- Merge back to `main` via PR on GitHub.

Good commit practices:

- Small, focused commits
- Clear messages (what + why)
- Run the dev server and tests (if any) before committing

## .gitignore recommendations

Add a `.gitignore` file if you don't have one. Example entries:

```
node_modules/
dist/
.vscode/
.env
npm-debug.log
.DS_Store
```

## Notes & Next steps

- I added routing scaffold but you need to install the runtime dependency `react-router-dom`:

```powershell
npm install react-router-dom
```

- After installing, start the dev server (`npm run dev`) and verify routes: `/`, `/portfolio`, `/projects`, `/projects/project-1`.

If you want, I can:

- Install `react-router-dom` for you and run the dev server to verify everything works.
- Replace or remove the test files (`ListGroup.tsx`, `test.tsx`) if they're not needed.
- Add CI (GitHub Actions) that runs `npm run build` on push.

Tell me which of those you'd like next and I'll proceed.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
