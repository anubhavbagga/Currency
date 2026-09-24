import { motion, AnimatePresence } from 'framer-motion';
import { useConverter } from './hooks/useConverter';
import ConverterCard from './components/ConverterCard';
import ResultDisplay from './components/ResultDisplay';
import RateLimitBadge from './components/RateLimitBadge';

function App() {
  const {
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
    clearError,
  } = useConverter();

  return (
    <div className="min-h-screen relative">
      <div className="bg-gradient-main" />
      <div className="grid-pattern" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Kurrency
            </span>
          </h1>
          <p className="text-white/35 text-sm">Fiat &amp; Crypto Converter</p>
        </motion.div>

        <ConverterCard
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          amount={amount}
          onFromChange={setFromCurrency}
          onToChange={setToCurrency}
          onAmountChange={setAmount}
          onConvert={handleConvert}
          onSwap={handleSwap}
          loading={loading}
          fiatCurrencies={fiatCurrencies}
          cryptoCurrencies={cryptoCurrencies}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="toast px-6 py-3 mt-4 flex items-center gap-3 max-w-md mx-auto"
            >
              <span className="text-amber-400 text-lg">⚠</span>
              <span className="text-white/80 text-sm flex-1">{error}</span>
              <button
                onClick={clearError}
                className="text-white/30 hover:text-white/60 transition-colors text-sm"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md mx-auto">
          <ResultDisplay result={result} />
        </div>

        <div className="fixed bottom-6 right-6">
          <RateLimitBadge rateLimit={rateLimit} />
        </div>
      </div>
    </div>
  );
}

export default App;
