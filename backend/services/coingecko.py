import os
import time
import httpx
from cachetools import TTLCache
from dotenv import load_dotenv

load_dotenv()

COINGECKO_BASE_URL = os.getenv("COINGECKO_BASE_URL", "https://api.coingecko.com/api/v3")
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", 360))

cache = TTLCache(maxsize=200, ttl=CACHE_TTL)
exchange_rates_cache: dict | None = None
exchange_rates_ts: float = 0

FIAT_CURRENCIES = [
    {"code": "USD", "name": "US Dollar", "symbol": "$", "flag": "🇺🇸"},
    {"code": "EUR", "name": "Euro", "symbol": "€", "flag": "🇪🇺"},
    {"code": "GBP", "name": "British Pound", "symbol": "£", "flag": "🇬🇧"},
    {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "flag": "🇮🇳"},
    {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "flag": "🇯🇵"},
    {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "flag": "🇦🇪"},
    {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$", "flag": "🇸🇬"},
    {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$", "flag": "🇨🇦"},
    {"code": "AUD", "name": "Australian Dollar", "symbol": "A$", "flag": "🇦🇺"},
    {"code": "CHF", "name": "Swiss Franc", "symbol": "Fr", "flag": "🇨🇭"},
    {"code": "CNY", "name": "Chinese Yuan", "symbol": "¥", "flag": "🇨🇳"},
    {"code": "SAR", "name": "Saudi Riyal", "symbol": "﷼", "flag": "🇸🇦"},
    {"code": "MYR", "name": "Malaysian Ringgit", "symbol": "RM", "flag": "🇲🇾"},
    {"code": "PKR", "name": "Pakistani Rupee", "symbol": "₨", "flag": "🇵🇰"},
    {"code": "BDT", "name": "Bangladeshi Taka", "symbol": "৳", "flag": "🇧🇩"},
]

FIAT_CODES = [f["code"].lower() for f in FIAT_CURRENCIES]

CRYPTO_IDS = {
    "bitcoin", "ethereum", "tether", "binancecoin", "ripple",
    "usd-coin", "staked-ether", "solana", "cardano", "dogecoin",
    "avalanche-2", "tron", "chainlink", "polkadot", "matic-network",
    "shiba-inu", "litecoin", "bitcoin-cash", "uniswap", "stellar",
    "monero", "eos", "tezos", "cosmos", "algorand",
    "filecoin", "aave", "decentraland", "the-graph", "fantom",
    "near", "internet-computer", "ethereum-classic", "vechain", "hedera-hashgraph",
    "maker", "leo-token", "quant-network", "immutable-x", "render-token",
    "theta-token", "axie-infinity", "apeswap-finance", "pepe", "floki",
    "bonk", "jupiter-exchange-solana", "sui", "aptos", "sei-network",
}


def is_fiat(currency: str) -> bool:
    return currency.lower() in FIAT_CODES


def is_crypto(currency: str) -> bool:
    return currency.lower() in CRYPTO_IDS


def detect_type(from_cur: str, to_cur: str) -> str:
    f, t = from_cur.lower(), to_cur.lower()
    if is_fiat(f) and is_fiat(t):
        return "fiat_to_fiat"
    if is_crypto(f) and is_fiat(t):
        return "crypto_to_fiat"
    if is_fiat(f) and is_crypto(t):
        return "fiat_to_crypto"
    return "crypto_to_crypto"


async def fetch_exchange_rates() -> dict:
    global exchange_rates_cache, exchange_rates_ts
    now = time.time()
    if exchange_rates_cache and (now - exchange_rates_ts) < CACHE_TTL:
        return exchange_rates_cache

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{COINGECKO_BASE_URL}/exchange_rates")
        resp.raise_for_status()
        data = resp.json()

    rates = {}
    for name, info in data.get("rates", {}).items():
        rates[name.lower()] = info.get("value", 1)

    exchange_rates_cache = rates
    exchange_rates_ts = now
    return rates


async def fetch_simple_price(ids: str, vs_currencies: str) -> dict:
    cache_key = f"simple_price:{ids}:{vs_currencies}"
    if cache_key in cache:
        return cache[cache_key]

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{COINGECKO_BASE_URL}/simple/price",
            params={"ids": ids, "vs_currencies": vs_currencies},
        )
        resp.raise_for_status()
        data = resp.json()

    cache[cache_key] = data
    return data


async def fetch_crypto_list():
    cache_key = "crypto_list_top50"
    if cache_key in cache:
        return cache[cache_key]

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{COINGECKO_BASE_URL}/coins/markets",
            params={
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 50,
                "page": 1,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    coins = [
        {"id": c["id"], "name": c["name"], "symbol": c["symbol"], "image": c.get("image", "")}
        for c in data
    ]
    cache[cache_key] = coins
    return coins


async def convert_currency(from_currency: str, to_currency: str, amount: float) -> dict:
    from_cur = from_currency.lower()
    to_cur = to_currency.lower()
    conv_type = detect_type(from_currency, to_currency)

    cache_key = f"convert:{from_cur}:{to_cur}:{amount}"
    if cache_key in cache:
        cached = cache[cache_key]
        cached["cached"] = True
        return cached

    rate = 0.0

    if conv_type == "fiat_to_fiat":
        rates = await fetch_exchange_rates()
        base_val = rates.get(from_cur, 0)
        target_val = rates.get(to_cur, 0)
        if base_val and target_val:
            rate = target_val / base_val

    elif conv_type == "crypto_to_fiat":
        data = await fetch_simple_price(from_cur, to_cur)
        if from_cur in data and to_cur in data[from_cur]:
            rate = data[from_cur][to_cur]

    elif conv_type == "fiat_to_crypto":
        data = await fetch_simple_price(to_cur, from_cur)
        if to_cur in data and from_cur in data[to_cur]:
            rate = 1.0 / data[to_cur][from_cur]

    elif conv_type == "crypto_to_crypto":
        data_usd_from = await fetch_simple_price(from_cur, "usd")
        data_usd_to = await fetch_simple_price(to_cur, "usd")
        price_from_usd = data_usd_from.get(from_cur, {}).get("usd", 0)
        price_to_usd = data_usd_to.get(to_cur, {}).get("usd", 0)
        if price_from_usd and price_to_usd:
            rate = price_from_usd / price_to_usd

    if rate == 0:
        raise ValueError(f"Conversion not available for {from_currency} to {to_currency}")

    converted = round(amount * rate, 6)

    result = {
        "from": from_cur,
        "to": to_cur,
        "amount": amount,
        "converted": converted,
        "rate": round(rate, 6),
        "type": conv_type,
        "cached": False,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    cache[cache_key] = result.copy()
    return result
