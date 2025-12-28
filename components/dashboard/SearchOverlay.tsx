"use client";

import { Search, X, BookText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export const SearchOverlay = ({
  onSearch,
  onClose,
}: {
  onSearch: (query: string) => void;
  onClose: () => void;
}) => {
  const t = useTranslations("Sidebar.Search");

  return (
    <>
      <div
        className="fixed inset-0 z-90 bg-black/5 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-100 w-full max-w-lg px-4 animate-in slide-in-from-top-4 fade-in duration-500">
        <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 via-yellow-400/5 to-blue-500/10 blur-2xl rounded-full animate-pulse"></div>

        <div className="relative group" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-[#050508]/40 backdrop-blur-[30px] rounded-3xl border border-white/10 group-hover:border-yellow-400/20 transition-all duration-500"></div>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] rounded-3xl"></div>

          <div className="relative flex items-center px-6 py-4">
            <div className="relative flex items-center justify-center mr-4">
              <BookText className="text-yellow-400/40 w-5 h-5 absolute animate-ping opacity-20" />
              <Search className="text-yellow-400 w-5 h-5 z-10 relative group-focus-within:rotate-90 transition-transform duration-500" />
            </div>

            <input
              autoFocus
              type="text"
              placeholder={t("placeholder")}
              className="bg-transparent border-none outline-none text-white px-2 w-full text-lg placeholder:text-gray-600 font-light tracking-wide selection:bg-yellow-400/30"
              onChange={(e) => onSearch(e.target.value)}
            />

            <Sparkles
              size={14}
              className="text-white/10 mr-4 group-focus-within:text-yellow-400/40 transition-colors"
            />

            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-yellow-400/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700"></div>
        </div>
      </div>
    </>
  );
};
