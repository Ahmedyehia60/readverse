import { Search, X } from "lucide-react";

export const SearchOverlay = ({
  onSearch,
  onClose,
}: {
  onSearch: (query: string) => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-md px-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-[#1a1438]/90 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-4 py-3 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <Search className="text-yellow-400 w-5 h-5" />
        <input
          autoFocus
          type="text"
          placeholder="Search for a category (e.g. History)..."
          className="bg-transparent border-none outline-none text-white px-3 w-full text-sm placeholder:text-white/40"
          onChange={(e) => onSearch(e.target.value)}
        />
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
