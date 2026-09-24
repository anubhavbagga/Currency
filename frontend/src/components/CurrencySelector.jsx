import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FIAT_FLAGS = {
  usd: '🇺🇸', eur: '🇪🇺', gbp: '🇬🇧', inr: '🇮🇳', jpy: '🇯🇵',
  aed: '🇦🇪', sgd: '🇸🇬', cad: '🇨🇦', aud: '🇦🇺', chf: '🇨🇭',
  cny: '🇨🇳', sar: '🇸🇦', myr: '🇲🇾', pkr: '🇵🇰', bdt: '🇧🇩',
};

export default function CurrencySelector({
  label,
  value,
  onChange,
  fiatCurrencies,
  cryptoCurrencies,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('fiat');
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const allOptions = [
    ...fiatCurrencies.map((c) => ({
      id: c.code.toLowerCase(),
      label: c.code,
      name: c.name,
      flag: c.flag,
      type: 'fiat',
    })),
    ...cryptoCurrencies.map((c) => ({
      id: c.id,
      label: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      type: 'crypto',
    })),
  ];

  const currentOption = allOptions.find((o) => o.id === value);

  const filtered = allOptions.filter((o) => {
    const matchesTab = tab === 'fiat' ? o.type === 'fiat' : o.type === 'crypto';
    const matchesSearch =
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm text-white/45 mb-2 font-medium">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/30 transition-all text-left"
      >
        {currentOption ? (
          <>
            {currentOption.type === 'crypto' && currentOption.image ? (
              <img src={currentOption.image} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <span className="text-xl">{currentOption.flag || FIAT_FLAGS[currentOption.id] || '💱'}</span>
            )}
            <span className="font-semibold text-white">{currentOption.label}</span>
            <span className="text-white/45 text-sm truncate">{currentOption.name}</span>
          </>
        ) : (
          <span className="text-white/45">Select currency</span>
        )}
        <svg
          className={`ml-auto w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 dropdown-menu"
          >
            <div className="flex gap-1 p-2 border-b border-white/[0.06]">
              <button
                onClick={() => { setTab('fiat'); setSearch(''); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  tab === 'fiat'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                💵 Fiat
              </button>
              <button
                onClick={() => { setTab('crypto'); setSearch(''); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  tab === 'crypto'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                ₿ Crypto
              </button>
            </div>

            <div className="p-2">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-purple-500/30"
              />
            </div>

            <div className="max-h-56 overflow-y-auto px-1 pb-1">
              {filtered.length === 0 ? (
                <div className="text-center py-4 text-white/30 text-sm">No currencies found</div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      value === option.id
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    {option.type === 'crypto' && option.image ? (
                      <img src={option.image} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <span className="text-lg">{option.flag || FIAT_FLAGS[option.id] || '💱'}</span>
                    )}
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-white/35 text-xs truncate">{option.name}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
