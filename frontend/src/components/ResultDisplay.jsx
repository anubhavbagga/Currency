import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const SYMBOLS = {
  usd: '$', eur: '€', gbp: '£', inr: '₹', jpy: '¥',
  aed: 'د.إ', sgd: 'S$', cad: 'C$', aud: 'A$', chf: 'Fr',
  cny: '¥', sar: '﷼', myr: 'RM', pkr: '₨', bdt: '৳',
};

export default function ResultDisplay({ result }) {
  if (!result) return null;

  const symbol = SYMBOLS[result.to] || '';
  const fromDisplay = result.from.toUpperCase();
  const toDisplay = result.to.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card-sm p-6 mt-4 shimmer"
    >
      <div className="text-center">
        <div className="text-sm text-white/40 mb-2">
          {result.type.replace(/_/g, ' ').toUpperCase()}
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {result.amount} {fromDisplay}
        </div>
        <div className="text-white/30 text-lg mb-2">=</div>
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
          {symbol}
          <CountUp
            end={result.converted}
            duration={1.5}
            decimals={result.converted > 100 ? 2 : 6}
            separator=","
            prefix=""
          />
        </div>
        <div className="text-sm text-white/35 mt-3">
          1 {fromDisplay} = {symbol}{result.rate.toLocaleString()} {toDisplay}
        </div>
        <div className="text-xs text-white/20 mt-2">
          {result.cached ? '⚡ Cached' : '🔄 Live'} • {result.timestamp}
        </div>
      </div>
    </motion.div>
  );
}
