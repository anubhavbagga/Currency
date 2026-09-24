from fastapi import APIRouter, HTTPException, Query
from services.coingecko import (
    FIAT_CURRENCIES,
    convert_currency,
    fetch_crypto_list,
)
from utils.rate_limiter import rate_limiter

router = APIRouter(prefix="/api", tags=["convert"])


@router.get("/convert")
async def convert(
    from_currency: str = Query(..., description="Source currency"),
    to_currency: str = Query(..., description="Target currency"),
    amount: float = Query(1.0, ge=0, description="Amount to convert"),
):
    try:
        result = await convert_currency(from_currency, to_currency, amount)
        if not result.get("cached"):
            rate_limiter.check_and_record()
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/currencies/fiat")
async def get_fiat_currencies():
    return FIAT_CURRENCIES


@router.get("/currencies/crypto")
async def get_crypto_currencies():
    rate_limiter.check_and_record()
    coins = await fetch_crypto_list()
    return coins


@router.get("/rate-limit/status")
async def get_rate_limit_status():
    return rate_limiter.get_status()
