# ACTIVO Weather (codewithDro)

A clean, responsive weather app: search any city, use your location, save favorites, and see current + hourly + 7-day forecast. Built with Vite, React, and Tailwind. No API key required for weather (Open-Meteo).

**Live app:** [https://weatherapp-rouge-one-79.vercel.app/](https://weatherapp-rouge-one-79.vercel.app/)

---

## Features

- **Search by city** — Geocode + current weather, hourly (24h), and 7-day forecast
- **Use your location** — Optional geolocation for “Your Location” weather
- **Saved locations** — Save favorites in the sidebar (desktop) or drawer (mobile); persisted in `localStorage`
- **Units** — Toggle °C / °F
- **i18n** — English, Spanish, Catalan, Portuguese
- **Fun fact & trivia** — Location-based fun fact and optional trivia
- **Share & notify** — Share current weather; request notification permission and schedule a weather notification
- **PWA** — Installable; basic offline support via service worker
- **Mobile-first** — Fixed header/footer with safe-area padding; keyboard-friendly drawer

---

## Tech stack

| Layer        | Choice                    |
|-------------|---------------------------|
| Build       | [Vite](https://vitejs.dev/) |
| UI          | [React](https://react.dev/) 18 |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) |
| Weather API | [Open-Meteo](https://open-meteo.com/) (no key) |
| Deploy      | [Vercel](https://vercel.com/) (static + optional `/api` proxy) |

---

## Prerequisites

- **Node.js** 18+
- (Optional) npm 9+ or equivalent

---

## Quick start

```bash
# Clone and enter the project
cd InstantWeatherApp

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Production build:**

```bash
npm run build
npm run preview
```

Preview runs at [http://localhost:5173](http://localhost:5173) by default.

---

## Scripts

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Start Vite dev server          |
| `npm run build`   | Production build → `dist/`    |
| `npm run build:staging`   | Build with staging env |
| `npm run build:production` | Build with production env |
| `npm run preview` | Serve `dist/` (default port 5173) |
| `npm run serve`   | Serve `dist/` on port 8080 (e.g. for Lighthouse) |
| `npm run lint`    | Run ESLint                     |
| `npm test`        | Run Vitest (watch)             |
| `npm run test:ci` | Run Vitest once (CI)           |
| `npm run lighthouse` | Run Lighthouse against local serve (port 8080) |

---

## Environment variables

Do **not** commit `.env`, `.env.local`, `.env.production`, or `.env.staging`. Use the example files as templates:

- **Development:** copy `.env.example` → `.env.local`
- **Staging/Production:** copy `.env.staging.example` / `.env.production.example` → set in CI or Vercel

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SENTRY_DSN` | No | Sentry error tracking DSN |
| `VITE_GA4_ID` | No | Google Analytics 4 Measurement ID |
| `VITE_ENV` | No | `development` / `staging` / `production` |
| `VITE_APP_VERSION` | No | App version (e.g. for Sentry) |
| `VITE_MAP_PROVIDER_BASE` | No | Override map tile URL (default: Yandex static maps) |
| `VITE_IMAGE_CDN_BASE` | No | Optional image CDN base URL |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment and env details.

---

## Project structure

```
InstantWeatherApp/
├── api/                    # Vercel serverless (optional weather proxy)
│   └── weather.js
├── public/                 # Static assets, manifest, service worker
├── src/
│   ├── components/         # React UI (SearchBar, WeatherCard, SavedLocations, etc.)
│   ├── hooks/              # useWeather, useSavedLocations
│   ├── services/           # weatherService (geocode, forecast, normalize)
│   ├── theme/              # ThemeProvider, useTheme
│   ├── App.jsx             # Main app composition
│   ├── i18n.jsx            # Translations (en, es, ca, pt)
│   ├── index.js            # Entry; Sentry, GA4, SW, error overlay (DEV only)
│   └── styles.css          # Tailwind + custom (safe-area, drawer, etc.)
├── .env.example
├── vercel.json             # Vite build + SPA rewrites
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Deployment

- **Vercel (recommended):** Connect the Git repo in the [Vercel dashboard](https://vercel.com/dashboard). Set **Framework Preset** to **Vite**, **Build Command** to `npm run build`, **Output Directory** to `dist`. Add env vars as needed. See [DEPLOYMENT.md](./DEPLOYMENT.md) and [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for details and 404 troubleshooting.
- **CI:** `.github/workflows/pr-build.yml` runs `npm ci`, `npm run lint`, `npm run test:ci`, and `npm run build` on PRs to `main`. `.github/workflows/lighthouse.yml` runs a Lighthouse audit after build.

---

## Optional: serverless proxy

The repo includes `api/weather.js` for Vercel (or similar) serverless. It can forward requests to Open-Meteo (no key) or OpenWeatherMap (server-side key). Supports caching, rate limiting, and optional `PROXY_API_KEY` / `PROXY_ALLOWED_ORIGINS`. The **frontend currently calls Open-Meteo directly**; you can switch it to use `/api/weather` and set server-side env vars if you prefer. See `api/weather.js` and [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## PWA & native

- **PWA:** `public/manifest.json`, `public/service-worker.js`, and `src/serviceWorkerRegistration.js` provide installability and basic offline behavior. See [DEPLOYMENT.md](./DEPLOYMENT.md).
- **Capacitor:** The app can be wrapped with [Capacitor](https://capacitorjs.com/) for iOS/Android. `src/native.js` and `@capacitor/local-notifications` support local notifications in the native build. See [DEPLOYMENT.md](./DEPLOYMENT.md) for store packaging notes.

---

## Accessibility & performance

- Keyboard-accessible drawer (focus trap, Escape to close).
- ARIA where needed; semantic HTML and `lang` for i18n.
- Safe-area padding for notched devices.
- Run `npm run build` and audit with Lighthouse (e.g. after `npm run serve` on port 8080, then `npm run lighthouse` if configured).

---

## License

Private / project use. See repository settings for details.
