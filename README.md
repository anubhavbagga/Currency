# Kurrency — Currency Converter

A full-stack web app that converts between **fiat currencies** (USD, INR, EUR...) and **cryptocurrencies** (Bitcoin, Ethereum...) in real time.

Built with **React.js + Vite** on the frontend and **FastAPI** on the backend, using the **CoinGecko API** for live rates.

---

## What It Does

- **Fiat to Fiat** — Convert USD to INR, EUR to JPY, etc.
- **Fiat to Crypto** — Convert 100 USD to Bitcoin
- **Crypto to Fiat** — Convert 1 BTC to INR
- **Crypto to Crypto** — Convert Bitcoin to Ethereum

All powered by a single API with smart caching and rate limiting to stay within CoinGecko's free tier (10 requests/hour).

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast dev server, modern tooling |
| Styling | TailwindCSS + Glassmorphism | Rapid UI, frosted glass aesthetic |
| Animation | Framer Motion | Smooth card transitions, swap rotation |
| Backend | FastAPI (Python) | Async, fast, auto-docs at `/docs` |
| HTTP Client | httpx | Async HTTP calls to CoinGecko |
| Caching | cachetools (TTLCache) | 6-min cache to save API quota |
| API | CoinGecko Free Tier | Live crypto + fiat rates, no key needed |

---

## Project Structure

```
currency-converter/
│
├── backend/
│   ├── main.py                 # FastAPI entry point, CORS setup
│   ├── routes/
│   │   └── convert.py          # All API endpoints
│   ├── services/
│   │   └── coingecko.py        # CoinGecko API calls, caching, conversion logic
│   ├── utils/
│   │   └── rate_limiter.py     # In-memory rate limiter (10 req/hr)
│   └── .env                    # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConverterCard.jsx      # Main glass card
│   │   │   ├── CurrencySelector.jsx   # Searchable dropdown with Fiat/Crypto tabs
│   │   │   ├── AmountInput.jsx        # Number input field
│   │   │   ├── ResultDisplay.jsx      # Conversion result with count-up animation
│   │   │   ├── SwapButton.jsx         # Animated swap icon (180° rotation)
│   │   │   └── RateLimitBadge.jsx     # Bottom-right badge showing requests remaining
│   │   ├── hooks/
│   │   │   └── useConverter.js        # Custom hook: all state + API logic
│   │   ├── api/
│   │   │   └── converter.js           # Axios calls to FastAPI
│   │   ├── App.jsx                    # Main app layout
│   │   ├── index.css                  # Global styles (glassmorphism, grid, shimmer)
│   │   └── main.jsx                   # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── README.md
└── tutorial.md                # Interview prep guide
```

---

## Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**

### 1. Start the Backend

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn httpx cachetools python-dotenv

# Run the server
uvicorn main:app --reload --port 8000
```

Backend is live at `http://localhost:8000`
Interactive API docs at `http://localhost:8000/docs`

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

### Convert Currency

```
GET /api/convert?from_currency=bitcoin&to_currency=inr&amount=1
```

**Parameters:**

| Param | Type | Required | Example |
|-------|------|----------|---------|
| `from_currency` | string | Yes | `usd`, `bitcoin`, `eur` |
| `to_currency` | string | Yes | `inr`, `ethereum`, `jpy` |
| `amount` | float | No (default: 1) | `100` |

**Response:**

```json
{
  "from": "bitcoin",
  "to": "inr",
  "amount": 1,
  "converted": 6842310.50,
  "rate": 6842310.50,
  "type": "crypto_to_fiat",
  "cached": false,
  "timestamp": "2026-09-24T12:00:00Z"
}
```

### List Fiat Currencies

```
GET /api/currencies/fiat
```

Returns 15 supported fiat currencies with code, name, symbol, and flag emoji.

### List Crypto Currencies

```
GET /api/currencies/crypto
```

Returns top 50 cryptocurrencies by market cap (cached for 6 minutes).

### Rate Limit Status

```
GET /api/rate-limit/status
```

```json
{
  "requests_used": 3,
  "requests_remaining": 7,
  "reset_in_seconds": 2400
}
```

---

## How It Works

### Conversion Flow

```
User enters amount + currencies
        │
        ▼
Frontend sends GET /api/convert
        │
        ▼
Backend checks cache (6-min TTL)
        │
   ┌────┴────┐
   │         │
Cache Hit  Cache Miss
   │         │
   ▼         ▼
Return    Call CoinGecko API
cached        │
result        ▼
          Cache response
              │
              ▼
          Return result
```

### Rate Limiting

CoinGecko free tier allows ~10 requests/hour. The backend:

1. **Caches** every API response for 6 minutes — repeated queries cost 0 requests
2. **Tracks** timestamps of each API call in-memory
3. **Blocks** requests when limit is reached, returns time until reset
4. **Exposes** status at `/api/rate-limit/status` (does NOT call CoinGecko)

### Smart Conversion Types

| Conversion | Strategy | API Calls |
|-----------|----------|-----------|
| Fiat → Fiat | Cross-rate via `/exchange_rates` (BTC-relative) | 1 (cached) |
| Crypto → Fiat | `/simple/price?ids=bitcoin&vs_currencies=inr` | 1 |
| Fiat → Crypto | Invert the crypto→fiat rate | 1 |
| Crypto → Crypto | Chain via USD as bridge currency | 2 |

---

## Design

**Glassmorphism** — frosted glass cards on a dark gradient background.

- `backdrop-filter: blur(20px)` for the frosted effect
- Semi-transparent backgrounds (`rgba(255,255,255,0.06)`)
- Subtle borders (`rgba(255,255,255,0.12)`)
- Dark purple-to-green radial gradient background
- CSS grid pattern overlay (no library)
- Purple (`#a855f7`) as primary accent, amber (`#f59e0b`) as secondary
- No blue anywhere

---

## Environment Variables

`backend/.env`:

```env
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
CACHE_TTL_SECONDS=360
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_SECONDS=3600
```

---

## License

MIT
