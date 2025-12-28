/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, CirclePlus, Loader2, Sparkles } from "lucide-react";
import { BookItem, SearchResults } from "@/models/users";
import { useTranslations } from "next-intl";


const searchCache: Record<string, SearchResults> = {};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: BookItem) => void;
}

export const SearchModal = ({ isOpen, onClose, onAddBook }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Dashboard");

  
  const lastRequestQuery = useRef("");

  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) {
      setSearchResults(null);
      setLoading(false);
      return;
    }

    
    if (searchCache[trimmedQuery]) {
      setSearchResults(searchCache[trimmedQuery]);
      setLoading(false);
      return;
    }

    setLoading(true);
    lastRequestQuery.current = trimmedQuery;

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmedQuery)}`
      );
      const data: SearchResults = await response.json();

    
      if (lastRequestQuery.current === trimmedQuery) {
        const results = data.error ? { error: data.error } : data;

       
        if (!data.error) searchCache[trimmedQuery] = results;

        setSearchResults(results);
      }
    } catch {
      if (lastRequestQuery.current === trimmedQuery) {
        setSearchResults({ error: "Failed to connect to search service." });
      }
    } finally {
      if (lastRequestQuery.current === trimmedQuery) {
        setLoading(false);
      }
    }
  }, []);


  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      handleSearch(searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, isOpen, handleSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xl transition-all"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d0925]/90 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-[80px] pointer-events-none"></div>

     
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight italic">
              {t("addBookModal.title")}
            </h2>
          </div>
          <button
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        
        <div className="relative group z-10">
          <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition-opacity"></div>
          <div className="relative flex items-center bg-[#1a1435]/80 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md">
            <Search className="ml-4 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("addBookModal.description")}
              className="w-full p-5 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-lg"
            />
            {loading && (
              <div className="mr-4">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

       
        <div className="mt-8 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
       
          {!loading && !searchResults?.items && !searchResults?.error && (
            <div className="text-center py-12 opacity-50">
              <div className="mb-4 inline-block p-5 rounded-full bg-white/5 border border-white/5 animate-bounce">
                <Search size={40} className="text-purple-400" />
              </div>
              <p className="text-sm font-bold tracking-widest text-gray-400">
                {t("addBookModal.scanMessage")}
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {searchResults?.items?.map((book) => (
              <button
                key={book.id}
                className="group w-full flex items-center p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/8 hover:border-purple-500/30 transition-all text-left relative overflow-hidden active:scale-95"
                onClick={() => onAddBook(book)}
              >
                {/* Book Cover */}
                <div className="relative w-14 h-20 mr-5 shrink-0 shadow-2xl overflow-hidden rounded-lg group-hover:rotate-3 transition-transform">
                  <img
                    src={
                      book.volumeInfo.imageLinks?.smallThumbnail ||
                      "/placeholder.png"
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                    alt="cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate text-base mb-1 group-hover:text-purple-300 transition-colors">
                    {book.volumeInfo.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate tracking-wide font-medium">
                    {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                  </p>
                </div>

                {/* Add Icon */}
                <div className="ml-4 p-2 bg-purple-500/20 rounded-xl text-purple-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <CirclePlus className="w-6 h-6" />
                </div>
              </button>
            ))}
          </div>

          {searchResults?.error && (
            <div className="text-center py-8 text-red-400 text-sm bg-red-500/5 rounded-2xl border border-red-500/20 animate-in fade-in zoom-in duration-300">
              {searchResults.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
