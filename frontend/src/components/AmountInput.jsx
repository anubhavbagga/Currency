export default function AmountInput({ value, onChange, onKeyPress }) {
  return (
    <div className="w-full">
      <label className="block text-sm text-white/45 mb-2 font-medium">Amount</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        min="0"
        step="any"
        placeholder="0.00"
        className="w-full px-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-2xl font-light placeholder:text-white/20 outline-none focus:border-purple-500/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}
