import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  const { data } = await api.get('/convert', {
    params: {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount,
    },
  });
  return data;
};

export const getFiatCurrencies = async () => {
  const { data } = await api.get('/currencies/fiat');
  return data;
};

export const getCryptoCurrencies = async () => {
  const { data } = await api.get('/currencies/crypto');
  return data;
};

export const getRateLimitStatus = async () => {
  const { data } = await api.get('/rate-limit/status');
  return data;
};
