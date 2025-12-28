/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, X, CirclePlus, Loader2, Sparkles } from "lucide-react";

import { BookItem, SearchResults } from "@/models/users";
import { useTranslations } from "next-intl";

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

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${query}`);
      const data: SearchResults = await response.json();
      setSearchResults(data.error ? { error: data.error } : data);
    } catch {
      setSearchResults({ error: "Failed to connect to search service." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounceFn = setTimeout(() => handleSearch(searchText), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText, isOpen, handleSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-md transition-all duration-500"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d0925]/80 border border-white/10 p-8 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-2xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px]"></div>

        {/* Header */}
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
          <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
          <div className="relative flex items-center bg-[#1a1435] rounded-2xl border border-white/10 overflow-hidden">
            <Search className="ml-4 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("addBookModal.description")}
              className="w-full p-5 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-lg"
            />
            {loading && (
              <Loader2 className="mr-4 w-5 h-5 text-purple-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
          {!loading && !searchResults?.items && searchText.trim() === "" && (
            <div className="text-center py-10 opacity-40">
              <div className="mb-4 inline-block p-4 rounded-full bg-white/5">
                <Search size={32} />
              </div>
              <p className="text-sm font-medium">
                {t("addBookModal.scanMessage")}
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {searchResults?.items?.map((book, index) => (
              <div
                key={index}
                className="group flex items-center p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => onAddBook(book)}
              >
                {/* Book Cover */}
                <div className="relative w-12 h-16 mr-5 shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={
                      book.volumeInfo.imageLinks?.smallThumbnail ||
                      "/placeholder.png"
                    }
                    className="w-full h-full object-cover rounded-md"
                    alt="cover"
                  />
                  <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/10"></div>
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-base mb-1 group-hover:text-purple-300 transition-colors">
                    {book.volumeInfo.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate tracking-wide">
                    {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                  </p>
                </div>

                {/* Add Icon */}
                <div className="ml-4 p-2 bg-purple-500/10 rounded-xl text-purple-400 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <CirclePlus className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {searchResults?.error && (
            <div className="text-center py-6 text-red-400 text-sm bg-red-500/10 rounded-xl border border-red-500/20">
              {searchResults.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
