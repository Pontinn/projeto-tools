# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev    # Start Next.js dev server (localhost:3000)
```

There are no build, lint, or test scripts configured — only `dev`.

## Architecture

**Stack:** Next.js 13 (Pages Router) + React 18 + plain CSS. No TypeScript, no testing framework, no linting.

### Pages Router structure

- `pages/_app.js` — global layout: shared `<Head>`, nav bar (hamburger-responsive), footer. All pages are wrapped here.
- `pages/index.js` — WhatsApp link generator. Uses `intl-tel-input` (initialized in `useEffect`) to handle country-code selection; on submit, redirects to `/link-gerado` with the generated URL as a query param.
- `pages/link-gerado.js` — display page for the generated WhatsApp link; reads `router.query.link`.
- `pages/gerador-qrcode.js` — batch QR Code generator. State-heavy client component; calls `/api/qrcode/batch`, persists history (last 20) and theme to `localStorage`.
- `pages/roletada.js` — interactive spinner/wheel. Uses Canvas animations and `localStorage` for option persistence.
- `pages/api/qrcode/batch.js` — only API route. Accepts `POST { urls: string[] }` (max 50), returns `{ results: [{ url, qrCode (dataURL), svg }] }` using the `qrcode` server-side library.
- `pages/politica-de-privacidade.js` / `pages/termos-de-uso.js` — static legal pages.

### Styling

Single global stylesheet at `styles/global.css`. No CSS modules, no Tailwind, no CSS-in-JS. Class names are referenced directly by string in JSX.

### Key dependencies

| Package | Purpose |
|---|---|
| `intl-tel-input` | Country dial-code picker on the WhatsApp form |
| `qrcode` | Server-side QR Code generation (PNG dataURL + SVG string) |
| `jspdf` | Client-side PDF export of QR Codes |
| `jszip` | Client-side ZIP bundling for bulk QR Code download |

### Navigation

Nav items are defined as a static array in `_app.js` (`NAV_ITEMS`). To add a new tool/page, add an entry there alongside the new file under `pages/`.

### localStorage keys

- `qrcode_history` — last 20 generated QR Codes (gerador-qrcode page)
- `qrcode_theme` — light/dark preference (gerador-qrcode page)
- Roleta page manages its own keys internally in `roletada.js`
