import Link from "next/link";

interface HeaderProps {
  onRefreshAll: () => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
}

export default function Header({
  onRefreshAll,
  autoRefresh,
  onAutoRefreshChange,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#b366ff]/30 pb-4 mb-6">
      <h1 className="text-xl tracking-wider">PREDICTION TERMINAL</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#b366ff]/70">MON/USDC (mock)</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshAll}
            className="px-3 py-1.5 border border-[#b366ff]/50 rounded text-xs font-semibold text-[#b366ff] hover:bg-[#b366ff]/10 transition-colors flex items-center gap-2"
            title="Refresh all data"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh All
          </button>
          <label className="flex items-center gap-2 text-xs text-[#b366ff]/70 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              className="w-4 h-4 accent-[#b366ff]"
            />
            Auto (10s)
          </label>
        </div>
        <Link href="/" className="text-sm underline text-[#b366ff]/80">
          ← Home
        </Link>
      </div>
    </header>
  );
}