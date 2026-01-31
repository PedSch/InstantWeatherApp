// Generic Vercel serverless proxy supporting multiple weather providers
// - Supports `provider=openweathermap` (requires server-side OPENWEATHER_KEY env var)
// - Supports `provider=open-meteo` (no key needed)
// Usage examples:
//  /api/weather?provider=open-meteo&latitude=51.5&longitude=-0.12&hourly=temperature_2m
//  /api/weather?provider=openweathermap&lat=51.5&lon=-0.12&units=metric

/*
  This proxy is designed for production use behind Vercel (or any serverless platform).

  Features:
  - Supports multiple providers (Open-Meteo no-key, OpenWeatherMap with server-side key).
  - Whitelists query params per provider and validates numeric inputs.
  - Caching: uses in-memory Map by default (per cold start). If Upstash Redis credentials
    are provided via `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, the proxy
    will use Upstash REST API to share cache across instances.
  - Rate limiting: simple per-IP counter implemented in Upstash when available, falling
    back to in-memory Map otherwise. This prevents a single IP from abusing the proxy.
  - Security: optional `PROXY_API_KEY` to require callers to provide `x-proxy-key` header,
    and optional `PROXY_ALLOWED_ORIGINS` list to limit allowed origins.

  Notes on Upstash usage:
  - Upstash REST API is used via the `/command` endpoint. We send Redis commands like
    `GET`, `SET`, and `INCR` as JSON arrays. Responses are parsed and used for cache/rate-limit logic.
  - Using Upstash allows shared caches and reliable rate limiting across serverless instances.

  Environment variables (recommended):
  - UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN: optional, enable shared cache/rate-limit
  - PROXY_CACHE_TTL: seconds (default 60)
  - PROXY_RATE_LIMIT, PROXY_RATE_WINDOW: rate limiting params
  - PROXY_API_KEY: optional, required header `x-proxy-key`
  - PROXY_ALLOWED_ORIGINS: comma-separated allowed origins
*/

const CACHE = new Map() // fallback in-memory cache per cold start
const RATE = new Map() // fallback in-memory rate-limiting per IP

// Upstash config read from env
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || ''
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''

async function upstashCommand(cmdArray) {
  // Executes a Redis command via Upstash REST `command` endpoint.
  // Example: cmdArray = ["GET", "key"]
  if (!UPSTASH_URL || !UPSTASH_TOKEN) throw new Error('Upstash not configured')
  const url = `${UPSTASH_URL}/command`
  const resp = await fetch(`${url}?token=${encodeURIComponent(UPSTASH_TOKEN)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cmdArray),
  })
  if (!resp.ok) throw new Error(`Upstash error: ${resp.status}`)
  return resp.json()
}

async function upstashGet(key) {
  try {
    const r = await upstashCommand(['GET', key])
    // Upstash command returns { result: <value> }
    return r && r.result != null ? r.result : null
  } catch (e) {
    return null
  }
}

async function upstashSet(key, value, ttlSec) {
  try {
    // Use SET key value EX ttl
    await upstashCommand(['SET', key, value, 'EX', String(ttlSec)])
    return true
  } catch (e) {
    return false
  }
}

async function upstashIncr(key, ttlSec) {
  try {
    // INCR and ensure expiry
    const incrRes = await upstashCommand(['INCR', key])
    const val = incrRes && incrRes.result != null ? Number(incrRes.result) : NaN
    if (!isNaN(val)) {
      // Set expiry (idempotent)
      await upstashCommand(['EXPIRE', key, String(ttlSec)])
      return val
    }
    return null
  } catch (e) {
    return null
  }
}

// Helper: build query string from allowed params only
function buildQs(params, allowed) {
  const search = new URLSearchParams()
  for (const k of allowed) {
    if (params.hasOwnProperty(k) && params[k] !== undefined && params[k] !== '') {
      search.set(k, String(params[k]))
    }
  }
  return search.toString()
}

module.exports = async (req, res) => {
  try {
    // Vercel BotID: reject requests classified as bots
    try {
      const { checkBotId } = await import('botid/server');
      const verification = await checkBotId();
      if (verification && verification.isBot) {
        res.statusCode = 403;
        return res.end(JSON.stringify({ error: 'Access denied' }));
      }
    } catch (e) {
      // if BotID not available, continue (e.g. local dev)
    }

    // Parse incoming URL and params
    const urlBase = req.url || ''
    const base = new URL(urlBase, 'http://localhost')
    const params = Object.fromEntries(base.searchParams.entries())

    const provider = (params.provider || 'open-meteo').toLowerCase()
    delete params.provider

    // Cache TTL in seconds (configurable via env) - default 60s
    const TTL = parseInt(process.env.PROXY_CACHE_TTL || '60', 10)

    // Rate limiting config (requests per window)
    const RATE_LIMIT = parseInt(process.env.PROXY_RATE_LIMIT || '60', 10)
    const RATE_WINDOW = parseInt(process.env.PROXY_RATE_WINDOW || '60', 10) * 1000 // ms

    // Optional proxy API key (server-side) to restrict usage: clients must send `x-proxy-key` header
    const PROXY_API_KEY = process.env.PROXY_API_KEY || ''

    // Optional allowed origins comma-separated
    const ALLOWED_ORIGINS = (process.env.PROXY_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)

    let targetUrl = null
    let cacheKey = null
    let allowed = []

    if (provider === 'openweathermap') {
      // Validate required numeric params lat/lon or allow city q param
      allowed = ['lat', 'lon', 'q', 'units', 'lang']
      // sanitize lat/lon if present
      if (params.lat && isNaN(Number(params.lat))) return res.status(400).json({ error: 'Invalid lat' })
      if (params.lon && isNaN(Number(params.lon))) return res.status(400).json({ error: 'Invalid lon' })

      const qs = buildQs(params, allowed)
      // Must include API key server-side
      const KEY = process.env.OPENWEATHER_KEY || process.env.VERCEL_OPENWEATHER_KEY
      if (!KEY) return res.status(500).json({ error: 'Missing server API key. Set OPENWEATHER_KEY in Vercel env.' })
      // Use `appid` as required by OpenWeatherMap
      targetUrl = `https://api.openweathermap.org/data/2.5/weather?${qs}${qs ? '&' : ''}appid=${KEY}`
      cacheKey = `owm:${qs}`
    } else if (provider === 'open-meteo' || provider === 'openm' || provider === 'mete') {
      // Open-Meteo expects latitude, longitude and variables; no key required
      allowed = ['latitude', 'longitude', 'hourly', 'daily', 'timezone', 'forecast_days']
      if (!params.latitude || !params.longitude) return res.status(400).json({ error: 'latitude and longitude required' })
      if (isNaN(Number(params.latitude)) || isNaN(Number(params.longitude))) return res.status(400).json({ error: 'Invalid latitude/longitude' })
      const qs = buildQs(params, allowed)
      targetUrl = `https://api.open-meteo.com/v1/forecast?${qs}`
      cacheKey = `om:${qs}`
    } else {
      return res.status(400).json({ error: 'Unsupported provider' })
    }

    // --------- Security checks: origin and proxy API key ---------
    // Check origin if ALLOWED_ORIGINS is set
    if (ALLOWED_ORIGINS.length > 0) {
      const origin = req.headers.origin || req.headers.referer || ''
      const matched = ALLOWED_ORIGINS.some(o => origin.includes(o))
      if (!matched) return res.status(403).json({ error: 'Origin not allowed' })
    }

    // Check proxy API key if configured
    if (PROXY_API_KEY) {
      const key = req.headers['x-proxy-key'] || req.headers['x-api-key'] || ''
      if (!key || key !== PROXY_API_KEY) return res.status(401).json({ error: 'Invalid proxy key' })
    }

    // --------- Rate limiting: prefer Upstash-backed counter, fallback to in-memory ---------
    try {
      const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : (req.socket && req.socket.remoteAddress) || 'unknown'
      const windowSec = Math.max(1, Math.floor(RATE_WINDOW / 1000))
      if (UPSTASH_URL && UPSTASH_TOKEN) {
        // Use Upstash INCR with expiry to count requests across instances
        const rlKey = `rl:${ip}`
        const cnt = await upstashIncr(rlKey, windowSec)
        if (cnt != null && cnt > RATE_LIMIT) return res.status(429).json({ error: 'Too many requests' })
      } else {
        // Fallback in-memory rate limiting (per instance only)
        const nowMs = Date.now()
        const entry = RATE.get(ip) || { count: 0, start: nowMs }
        if (nowMs - entry.start > RATE_WINDOW) {
          // reset window
          entry.count = 0
          entry.start = nowMs
        }
        entry.count += 1
        RATE.set(ip, entry)
        if (entry.count > RATE_LIMIT) {
          return res.status(429).json({ error: 'Too many requests' })
        }
      }
    } catch (e) {
      // if rate limiting fails, continue (do not block)
      console.error('Rate limiting error', e)
    }

    // Check cache: prefer Upstash-backed shared cache, fallback to in-memory
    if (cacheKey) {
      try {
        if (UPSTASH_URL && UPSTASH_TOKEN) {
          const cached = await upstashGet(cacheKey)
          if (cached) {
            // cached is stored as JSON string
            try {
              const entry = JSON.parse(cached)
              res.statusCode = entry.status || 200
              for (const [k, v] of Object.entries(entry.headers || {})) res.setHeader(k, v)
              return res.end(entry.body)
            } catch (e) {
              // if parsing fails, ignore and continue
            }
          }
        } else {
          const now = Date.now()
          if (CACHE.has(cacheKey)) {
            const entry = CACHE.get(cacheKey)
            if (entry.expiresAt > now) {
              res.statusCode = entry.status
              for (const [k, v] of Object.entries(entry.headers || {})) {
                res.setHeader(k, v)
              }
              return res.end(entry.body)
            } else {
              CACHE.delete(cacheKey)
            }
          }
        }
      } catch (e) {
        console.error('Cache lookup error', e)
      }
    }

    // Fetch target
    const fetchRes = await fetch(targetUrl, { method: 'GET' })
    const body = await fetchRes.text()

    // Set caching headers to allow Vercel edge/CDN to cache if desired
    const cacheControl = `public, max-age=${TTL}, s-maxage=${TTL}, stale-while-revalidate=${Math.min(60, TTL)}`
    res.setHeader('Cache-Control', cacheControl)
    const contentType = fetchRes.headers.get('content-type') || 'application/json'
    res.setHeader('Content-Type', contentType)

    // Store in cache if successful: prefer Upstash-backed cache
    if (fetchRes.ok && cacheKey) {
      try {
        const entry = {
          status: fetchRes.status,
          headers: { 'content-type': contentType, 'cache-control': cacheControl },
          body,
        }
        if (UPSTASH_URL && UPSTASH_TOKEN) {
          await upstashSet(cacheKey, JSON.stringify(entry), TTL)
        } else {
          const now2 = Date.now()
          CACHE.set(cacheKey, { ...entry, expiresAt: now2 + TTL * 1000 })
        }
      } catch (e) {
        // ignore cache errors
        console.error('Cache store error', e)
      }
    }

    res.statusCode = fetchRes.status
    return res.end(body)
  } catch (err) {
    console.error('Proxy error', err)
    return res.status(500).json({ error: String(err) })
  }
}
