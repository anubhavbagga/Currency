import { motion } from 'framer-motion';
import CurrencySelector from './CurrencySelector';
import AmountInput from './AmountInput';
import SwapButton from './SwapButton';

export default function ConverterCard({
  fromCurrency,
  toCurrency,
  amount,
  onFromChange,
  onToChange,
  onAmountChange,
  onConvert,
  onSwap,
  loading,
  fiatCurrencies,
  cryptoCurrencies,
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onConvert();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-8 w-full max-w-md mx-auto"
    >
      <div className="space-y-5">
        <AmountInput value={amount} onChange={onAmountChange} onKeyPress={handleKeyPress} />

        <CurrencySelector
          label="From"
          value={fromCurrency}
          onChange={onFromChange}
          fiatCurrencies={fiatCurrencies}
          cryptoCurrencies={cryptoCurrencies}
        />

        <SwapButton onClick={onSwap} />

        <CurrencySelector
          label="To"
          value={toCurrency}
          onChange={onToChange}
          fiatCurrencies={fiatCurrencies}
          cryptoCurrencies={cryptoCurrencies}
        />

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConvert}
          disabled={loading || !amount || Number(amount) <= 0}
          className="w-full btn-primary py-4 text-lg mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Converting...
            </span>
          ) : (
            'Convert'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
