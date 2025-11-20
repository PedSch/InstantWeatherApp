# InstantWeatherApp
A clean, minimal web app that shows current weather for any city using a free weather API. Simple UI, instant results, and responsive design. Impressive but fast to build.

This workspace now contains a minimal Vite + React + Tailwind scaffold created by Copilot.

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

Files added:
- `public/index.html`, `package.json`, `postcss.config.js`, `tailwind.config.js`
- `src/` with `App.jsx`, `index.js`, `styles.css`, and components in `src/components/`

Notes
- This project uses Open-Meteo (no API key required) for quick demos. The app performs a geocoding lookup and then fetches `current_weather` from the Open-Meteo API.
- `.env` is not required and was removed from the repo. Do NOT commit sensitive keys to the repository.

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
