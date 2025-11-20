# InstantWeatherApp
A clean, minimal web app that shows current weather for any city using a free weather API. Simple UI, instant results, and responsive design. Impressive but fast to build.

This workspace now contains a minimal Vite + React + Tailwind scaffold created by Pedro Schmidt (codewithdro).

Quick start (Open-Meteo, no API key required)

1. Install dependencies:
```bash
cd /workspaces/InstantWeatherApp
npm install
```

2. Run dev server:
```bash
npm run dev -- --host
```

3. Open the app in your browser at `http://localhost:5173`

Build for production:
```bash
npm run build
npm run preview -- --host
```


Notes
- This project uses Open-Meteo (no API key required) for quick demos. 
Production & proxy notes
- The project includes a serverless proxy at `api/weather.js` that can forward requests to either Open-Meteo (no key) or OpenWeatherMap (server-side key). The proxy supports:
	- Caching (in-memory per instance) and sets `Cache-Control` headers for edge caching.
	- Configurable TTL via `PROXY_CACHE_TTL` (seconds).
	- Optional rate limiting via `PROXY_RATE_LIMIT` and `PROXY_RATE_WINDOW` (seconds).
	- Optional proxy API key: set `PROXY_API_KEY` to require callers to provide `x-proxy-key` header.
	- Optional allowed origins: set `PROXY_ALLOWED_ORIGINS` to a comma-separated list of allowed origins (the function will check the `Origin` or `Referer` header).

Environment variables (recommended for production on Vercel)
- `OPENWEATHER_KEY` — (server-side) Your OpenWeatherMap API key. Set this in Vercel Dashboard as an Environment Variable.
- `PROXY_CACHE_TTL` — Cache TTL in seconds (default: `60`). Controls `s-maxage` and `max-age` headers and in-memory TTL.
- `PROXY_RATE_LIMIT` — Requests per IP per window (default: `60`).
- `PROXY_RATE_WINDOW` — Window size (seconds) for rate limiting (default: `60`).
- `PROXY_API_KEY` — Optional API key for callers to use (required header: `x-proxy-key`).
- `PROXY_ALLOWED_ORIGINS` — Optional comma-separated list, e.g. `https://yourdomain.com,https://app.example.com`.

Security & CI
- The repository contains a GitHub Action that runs `gitleaks` on PRs and pushes to `main` to detect secrets. Keep this enabled and add additional scanning if needed.

Using Upstash or Redis for shared caching (optional)
- The proxy uses an in-memory cache per serverless instance (cold-start based). For production at scale, you can replace the in-memory cache with Upstash Redis or another managed store so cached responses are shared across instances. Example approach:
	1. Create an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel env.
	2. In `api/weather.js`, detect those env vars and use Upstash REST API to GET/SET cached responses with expiry instead of the in-memory `CACHE` Map.

Helpful commands
- Local dev (no keys needed):
```bash
npm install
npm run dev -- --host
```

- Test proxy locally with a server-side key set (do NOT commit `.env`):
```bash
export OPENWEATHER_KEY=your_key_here
export PROXY_CACHE_TTL=60
npm run dev
# then try: http://localhost:5173/api/weather?provider=open-meteo&latitude=51.5&longitude=-0.12&hourly=temperature_2m
```

Deploying on Vercel
- Set `OPENWEATHER_KEY` and any `PROXY_*` env vars in the Vercel UI. Do not use `VITE_`-prefixed env vars for server-side secrets.
- Vercel will run `npm run build` and deploy the `dist` static output and `/api` serverless functions.

Continuous Integration
- A pull-request workflow (`.github/workflows/pr-build.yml`) has been added to run `npm ci` and `npm run build` on PRs to prevent accidental broken builds.

Crash reporting & Analytics
- Sentry: A lightweight initializer is provided at `src/initSentry.js`. To enable Sentry in the browser set `VITE_SENTRY_DSN` in your environment (Vercel: set in Project > Settings > Environment Variables). Install the SDK in your project with:

```bash
npm install @sentry/react
```

Then Sentry will be dynamically imported at runtime when `VITE_SENTRY_DSN` is present.

- Firebase Crashlytics: Crashlytics is a native SDK (iOS/Android) and is best used for Capacitor builds. Add the native SDK(s) in Xcode/Android Studio and follow Firebase docs for setup. The web SDK is focused on analytics rather than crash reporting.

- Vercel Analytics: Enable from the Vercel dashboard for lightweight server-side analytics (requires Vercel Pro for historical retention). You can also add client-side analytics (Plausible, Google Analytics, or Segment) conditionally in the app.

PWA (Installable + Offline)
- Files added: `public/manifest.json`, `public/service-worker.js`, `public/icons/*` and a small service worker registrar in `src/serviceWorkerRegistration.js`.
- The service worker is minimal: it precaches core files, does network-first for `/api/` requests and cache-first for static assets. It enables basic offline resilience and makes the app installable on supported browsers (Safari will use the manifest and "Add to Home Screen" flow).
- Note: Safari on iOS has special behavior — it doesn't show an "install" prompt and requires some additional meta tags and icons in your app package. Test on devices.

- An offline fallback page `public/offline.html` was added and is used by the service worker when navigation fails.

Native / Capacitor note — Local notifications
- A small native helper is scaffolded at `src/native.js` which tries to use Capacitor's Local Notifications plugin when running in a native context and falls back to the Web Notifications API in the browser.
- To enable native local notifications in your Capacitor build:

```bash
# install the Capacitor plugin (run locally, not in the container if you're building natively)
npm install @capacitor/local-notifications
npx cap sync
```

- iOS: add the `UNUserNotificationCenter` usage and enable push/local notification capabilities in Xcode. Request permissions at runtime before scheduling notifications. The helper `scheduleLocalNotification` will dynamically use the native plugin when available.

App Store packaging guidance
- Apple can reject apps that are simple web views. When using Capacitor, ensure the native app provides value beyond the website:
	- Use native permissions and purpose strings in `Info.plist` (e.g., `NSLocationWhenInUseUsageDescription`) and show rationales in the UI.
	- Add native navigation, offline handling, and at least one native feature (push notifications, widgets, background fetch, or deep links) if suitable.
	- Provide proper app icons, launch screens, and screenshots. Localize metadata where possible.

Accessibility & Performance checklist
- Accessibility:
	- Ensure all interactive elements are reachable by keyboard and have clear focus states.
	- Add ARIA labels where semantic HTML doesn't express intent (icons, dynamic regions).
	- Ensure color contrast meets WCAG AA (4.5:1 for normal text).
	- Use `lang` attribute on `html` and update on locale switches (`<html lang="en">`).

- Performance:
	- Run `npm run build` and test with Lighthouse (in Chrome DevTools) for performance, accessibility, best-practices and SEO.
	- Enable gzip/brotli on the CDN or hosting provider (Vercel handles this automatically).
	- Keep vendor bundles small; dynamically import large libs like Sentry only when enabled.

