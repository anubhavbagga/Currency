import { useState, useEffect, useCallback, useRef } from 'react';
import {
  convertCurrency,
  getFiatCurrencies,
  getCryptoCurrencies,
  getRateLimitStatus,
} from '../api/converter';

export function useConverter() {
  const [fiatCurrencies, setFiatCurrencies] = useState([]);
  const [cryptoCurrencies, setCryptoCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('usd');
  const [toCurrency, setToCurrency] = useState('bitcoin');
  const [amount, setAmount] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimit, setRateLimit] = useState({ requests_used: 0, requests_remaining: 10, reset_in_seconds: 0 });
  const debounceTimer = useRef(null);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const [fiat, crypto] = await Promise.all([
          getFiatCurrencies(),
          getCryptoCurrencies(),
        ]);
        setFiatCurrencies(fiat);
        setCryptoCurrencies(crypto);
      } catch (err) {
        console.error('Failed to load currencies:', err);
      }
    };
    loadCurrencies();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getRateLimitStatus();
        setRateLimit(status);
      } catch (err) {
        console.error('Failed to fetch rate limit status:', err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const doConvert = useCallback(async (from, to, amt) => {
    if (!from || !to || !amt || isNaN(amt) || Number(amt) <= 0) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await convertCurrency(from, to, Number(amt));
      setResult(data);
      const status = await getRateLimitStatus();
      setRateLimit(status);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(`Limit reached. Try again in ${err.response.data?.detail?.reset_in_seconds || 60}s`);
      } else if (err.response?.status === 400) {
        setError('Conversion not available');
      } else {
        setError('Could not reach server');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerConvert = useCallback((from, to, amt) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      doConvert(from, to, amt);
    }, 600);
  }, [doConvert]);

  const handleConvert = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    doConvert(fromCurrency, toCurrency, amount);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const clearError = () => setError(null);

  return {
    fiatCurrencies,
    cryptoCurrencies,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    amount,
    setAmount,
    result,
    loading,
    error,
    rateLimit,
    handleConvert,
    handleSwap,
    triggerConvert,
    clearError,
  };
}
