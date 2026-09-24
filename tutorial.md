# Kurrency — Interview Prep Tutorial

## How the App Works (30-Second Version)

```
React Frontend  ──GET /api/convert──▶  FastAPI Backend  ──▶  CoinGecko API
   (Vite)                                 │                       │
                                          ├── Check Cache ◀───────┘
                                          ├── Call API (if miss)
                                          ├── Rate Limit Check
                                          └── Return JSON
```

1. User picks currencies, enters amount, clicks Convert
2. Frontend hits `GET /api/convert` on FastAPI
3. Backend checks cache first — if hit, returns instantly (0 API calls used)
4. If cache miss, calls CoinGecko, caches response for 6 minutes, returns result
5. Frontend shows result with count-up animation

---

## Architecture Decisions

### Why FastAPI?

- **Async native** — `async/await` with httpx means non-blocking CoinGecko calls
- **Auto-docs** — `/docs` gives you Swagger UI for free
- **Fast** — Starlette underneath, one of the fastest Python frameworks
- **Type safety** — Pydantic validates request params automatically

### Why Vite?

- **ESBuild** — written in Go, 10-100x faster than Webpack
- **Instant HMR** — changes reflect in the browser immediately
- **Zero config** — minimal setup, works out of the box

### Why useState over Redux?

- State is flat: currencies, amount, result, loading, error
- No cross-component state sharing needed
- Custom hook (`useConverter`) encapsulates all logic cleanly

---

## Backend Deep Dive

### Rate Limiting

```
In-memory deque of timestamps
├── Append timestamp on each CoinGecko call
├── On check: remove timestamps older than 1 hour
├── If count >= 10  →  429 + time-until-reset
└── If count < 10   →  allow + append
```

**Why in-memory?** Single server, no distributed state needed. For production, use Redis with `INCR` + `EXPIRE`.

**Why 10 req/hr?** CoinGecko free tier limit. We conserve by caching aggressively.

### Caching (TTLCache)

```python
cache = TTLCache(maxsize=200, ttl=360)  # 6-minute TTL
```

- Key format: `convert:{from}:{to}:{amount}`
- Cache hit = 0 API calls burned = rate limit unaffected
- Exchange rates cached separately (shared across all fiat pairs)

**Why 6 minutes?** 10 requests/hour = 1 every 6 minutes. If 100 people convert USD→INR in 6 min, only 1 API call is made.

### CoinGecko Strategy

| Conversion Type | How | API Calls |
|----------------|-----|-----------|
| Fiat → Fiat | `/exchange_rates` → compute cross-rate | 1 (cached) |
| Crypto → Fiat | `/simple/price?ids=bitcoin&vs_currencies=inr` | 1 |
| Fiat → Crypto | Invert crypto→fiat rate (1/rate) | 1 |
| Crypto → Crypto | Chain via USD: get both prices in USD, divide | 2 |

**Key insight:** `/exchange_rates` returns ALL fiat rates relative to BTC in one call. Cross-rate formula: `rate(USD→INR) = rate_btc_inr / rate_btc_usd`.

### Error Handling

| Error | Status | Cause |
|-------|--------|-------|
| Rate limit hit | 429 | 10+ requests in the hour |
| Invalid pair | 400 | Currency doesn't exist or pair unsupported |
| CoinGecko down | 503 | Network/API failure |
| Cache miss + under limit | 200 | Normal flow, calls CoinGecko |

---

## Frontend Deep Dive

### Component Tree

```
App
├── ConverterCard
│   ├── AmountInput
│   ├── CurrencySelector (From)
│   ├── SwapButton
│   └── CurrencySelector (To)
├── ResultDisplay
└── RateLimitBadge
```

### useConverter Hook

Custom hook that owns all state and logic:

```
useConverter()
├── State: fromCurrency, toCurrency, amount, result, loading, error
├── Effects:
│   ├── Load fiat + crypto currencies on mount
│   └── Poll rate-limit/status every 30 seconds
└── Methods:
    ├── handleConvert()     — immediate API call
    ├── triggerConvert()    — debounced (600ms)
    └── handleSwap()        — swap from ↔ to
```

### Debouncing

- User types "1000" → 4 keystrokes → without debounce = 4 API calls
- With 600ms debounce: only 1 call after user stops typing
- Implementation: `useRef` stores timer, `clearTimeout` resets on each keystroke

### CurrencySelector

- Two tabs: **Fiat** 💵 and **Crypto** ₿
- Searchable input filters by code, name, or ID
- Crypto shows coin logo from CoinGecko image URL
- Fiat shows flag emoji + currency code + full name
- Keyboard navigable, closes on outside click

### Animations (Framer Motion)

| Element | Effect | Why |
|---------|--------|-----|
| ConverterCard | Slide up (y: 40→0) + fade | Page entrance |
| SwapButton | 180° rotation on tap | Satisfying feedback |
| ResultDisplay | Slide up + shimmer | Draw attention |
| Error toast | Scale 0.95→1 | Alert without jarring |

---

## System Design Concepts

### Caching Strategies

| Strategy | How | Used Here? |
|----------|-----|-----------|
| Cache-aside | App checks cache → miss → fetch → store | Yes |
| Write-through | Write to cache + DB at same time | No |
| Read-through | Cache fetches from source on miss | No |

### Rate Limiting Algorithms

| Algorithm | Description |
|-----------|-------------|
| Fixed Window | Count in fixed time bucket (used here) |
| Sliding Window | Rolling window, smoother |
| Token Bucket | Tokens refill, consume per request |
| Leaky Bucket | Queue + process at fixed rate |

### REST Best Practices

- Nouns for endpoints: `/api/convert` not `/api/doConvert`
- GET for reads, proper status codes (200, 400, 429, 503)
- CORS configured for frontend origin only

---

## Interview Questions & Answers

### "Walk me through the conversion flow."

> User enters amount and selects from/to currencies. Frontend calls GET /api/convert on our FastAPI backend. Backend first checks TTLCache — if the same request was made within 6 minutes, it returns the cached result instantly with zero CoinGecko API calls. On cache miss, it calls CoinGecko, caches the response, and returns it. The rate limiter tracks every API call timestamp and blocks with 429 if the 10/hour limit is reached.

### "Why is caching important here?"

> CoinGecko free tier only allows 10 requests per hour. Without caching, a single user converting 10 times would exhaust the quota. With 6-minute TTL caching, 100 users converting the same pair within 6 minutes only uses 1 API call. Cache hits don't touch the rate limiter at all.

### "How does fiat-to-fiat work without extra API calls?"

> We call CoinGecko's `/exchange_rates` endpoint once, which returns all fiat currencies' rates relative to BTC. We compute any fiat cross-rate using the formula: `rate(A→B) = btc_rate_B / btc_rate_A`. One call covers all 15 fiat pairs.

### "What happens when CoinGecko is down?"

> Backend returns 503. Frontend shows "Could not reach server" toast. Cached responses remain available until their TTL expires. Failed requests don't count against the rate limit.

### "How would you scale this to production?"

1. Redis for distributed caching and rate limiting
2. CoinGecko API key for higher limits (30-500 req/min)
3. Database for conversion history
4. Load balancer for multiple backend instances
5. WebSocket for real-time price streaming

### "Why debounce the convert trigger?"

> Without debounce, every keystroke fires an API call. If a user types "1000", that's 4 calls. With 600ms debounce, only the final call fires after they stop typing. This saves rate limit budget significantly.

### "Explain the glassmorphism design."

> Semi-transparent backgrounds (`rgba(255,255,255,0.06)`) with `backdrop-filter: blur(20px)` create a frosted glass effect. Subtle borders at 12% opacity add depth. Dark gradient background (purple-to-green, no blue) makes the glass cards pop.

---

## Key Numbers

| What | Value |
|------|-------|
| CoinGecko free tier | ~10 requests/hour |
| Cache TTL | 6 minutes |
| Debounce delay | 600ms |
| Rate limit poll interval | 30 seconds |
| Crypto list | Top 50 by market cap |
| Max cache entries | 200 |
| Supported fiat currencies | 15 |

---

## Commands

```bash
# Backend
cd backend
pip install fastapi uvicorn httpx cachetools python-dotenv
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Test API manually
curl "http://localhost:8000/api/convert?from_currency=usd&to_currency=inr&amount=1"
curl "http://localhost:8000/api/convert?from_currency=bitcoin&to_currency=usd&amount=1"
curl "http://localhost:8000/api/rate-limit/status"
```

---

## Interview Tips

1. **Start big picture** — flow first, then dive into specifics
2. **Mention trade-offs** — "in-memory is simple; Redis for production"
3. **Know the numbers** — 10 req/hr, 6-min TTL, 600ms debounce
4. **Discuss error cases** — not just the happy path
5. **Be ready to extend** — "next I'd add WebSocket for live prices"
