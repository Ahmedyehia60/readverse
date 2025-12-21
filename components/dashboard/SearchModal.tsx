/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, X, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookItem, SearchResults } from "@/models/users";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#20193f] p-6 rounded-xl shadow-2xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Search Books</h2>
          <Button
            className="p-1 bg-white/10 hover:bg-white/30 rounded-full"
            onClick={onClose}
          >
            <X className="w-4 h-4 text-white" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by the title..."
            className="w-full p-3 pl-10 rounded-lg bg-[#454350] text-white focus:outline-none focus:ring-2 focus:ring-[#2B1B72]"
          />
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {loading && <p className="text-center text-gray-400">Loading...</p>}

          {searchResults?.items?.map((book) => (
            <div
              key={book.id}
              className="flex items-center p-2 rounded hover:bg-[#3C288D] cursor-pointer"
              onClick={() => onAddBook(book)}
            >
              <img
                src={
                  book.volumeInfo.imageLinks?.smallThumbnail ||
                  "/placeholder.png"
                }
                className="w-8 h-12 object-cover mr-3 rounded"
                alt="cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">
                  {book.volumeInfo.title}
                </p>
                <p className="text-xs text-gray-400">
                  {book.volumeInfo.authors?.[0]}
                </p>
              </div>
              <CirclePlus className="text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
