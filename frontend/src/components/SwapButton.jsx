import { motion } from 'framer-motion';

export default function SwapButton({ onClick }) {
  return (
    <div className="flex justify-center py-2">
      <motion.button
        onClick={onClick}
        whileTap={{ rotate: 180 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/30 transition-all group cursor-pointer"
      >
        <svg
          className="w-5 h-5 text-white/50 group-hover:text-purple-400 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      </motion.button>
    </div>
  );
}
