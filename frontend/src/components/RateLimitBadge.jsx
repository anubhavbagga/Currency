import { motion } from 'framer-motion';

export default function RateLimitBadge({ rateLimit }) {
  const { requests_used, requests_remaining, reset_in_seconds } = rateLimit;

  const getColor = () => {
    if (requests_remaining <= 1) return 'text-red-400 border-red-400/30 bg-red-500/10';
    if (requests_remaining <= 3) return 'text-amber-400 border-amber-400/30 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10';
  };

  const getDotColor = () => {
    if (requests_remaining <= 1) return 'bg-red-400';
    if (requests_remaining <= 3) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const formatReset = () => {
    if (reset_in_seconds <= 0) return 'now';
    const min = Math.floor(reset_in_seconds / 60);
    const sec = reset_in_seconds % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getColor()}`}
    >
      <span className={`w-2 h-2 rounded-full ${getDotColor()} animate-pulse`} />
      <span>
        {requests_remaining} / {requests_used + requests_remaining} remaining
      </span>
      {reset_in_seconds > 0 && (
        <span className="text-white/30 text-xs">• resets in {formatReset()}</span>
      )}
    </motion.div>
  );
}
