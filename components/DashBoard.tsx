/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, Search, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "./SideBar";
import UserButton from "./UserButton";

import SidebarIcon from "./SideBarIcon";

// ==================Types==========================
interface BookVolumeInfo {
  title: string;
  authors?: string[];
  imageLinks?: {
    smallThumbnail: string;
    thumbnail: string;
  };
}

interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
}

interface SearchResults {
  items?: BookItem[];
  error?: string;
}

// ==================DashBoard Component==========================
function DashBoard() {
  const [activeIcon, setActiveIcon] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showBar, setShowBar] = useState(false);

  // ===============Search Handler=======================
  const handleSearch = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setSearchResults(null);

    const endpoint = `/api/search?q=${query}`;

    try {
      const response = await fetch(endpoint);
      const data: SearchResults = await response.json();

      if (data.error) {
        setSearchResults({ error: data.error });
      } else {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error fetching data from internal API:", error);
      setSearchResults({ error: "Failed to connect to search service." });
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============Debounce search input=======================

  useEffect(() => {
    if (!showModal) return;

    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, showModal, handleSearch]);

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <UserButton />
      <Button
        className="absolute top-4 right-4 p-5 bg-[#2B1B72] text-white hover:bg-blue-800 z-10"
        onClick={() => setShowModal(true)}
      >
        Add Book
      </Button>

      {showBar ? (
        <>
          <AppSidebar />
          <ChevronsLeft
            className="absolute top-1/2 -translate-y-1/2 left-70 cursor-pointer"
            onClick={() => setShowBar(!showBar)}
          />
        </>
      ) : (
        <>
          <ChevronsRight
            className="absolute top-1/2 -translate-y-1/2 left-25 cursor-pointer"
            onClick={() => setShowBar(!showBar)}
          />
          <SidebarIcon activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
        </>
      )}

      {showModal && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center 
            bg-black/20 backdrop-blur-sm 
            transition-opacity duration-300
          "
          onClick={() => {
            setShowModal(false);
            setSearchResults(null);
            setSearchText("");
          }}
        >
          <div
            className="bg-[#20193f] p-6 rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Search Books</h2>
              <Button
                className="p-1 bg-white/10 hover:bg-white/30 rounded-full cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by the title of the book..."
                className="w-full p-3 pl-10 rounded-lg bg-[#454350] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B1B72]"
              />
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto">
              {loading && (
                <p className="text-center text-gray-400">Loading...</p>
              )}

              {searchResults &&
              searchResults.items &&
              searchResults.items.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.items.map((book) => (
                    <li
                      key={book.id}
                      className="flex items-center p-2 rounded hover:bg-[#3C288D] transition cursor-pointer"
                    >
                      <img
                        src={
                          book.volumeInfo.imageLinks?.smallThumbnail ||
                          "/placeholder.png"
                        }
                        alt={book.volumeInfo?.title || "Book cover"}
                        className="w-8 h-12 object-cover mr-3 rounded"
                      />
                      <div>
                        <p className="font-semibold text-sm">
                          {book.volumeInfo?.title || "No Title"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {book.volumeInfo.authors?.[0] || "Unknown Author"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : searchResults && searchResults.error ? (
                <p className="text-center text-red-400">
                  Error: {searchResults.error}
                </p>
              ) : searchResults &&
                searchResults.items &&
                searchResults.items.length === 0 &&
                searchText.length > 0 ? (
                <p className="text-center text-gray-400">
                  No books found matching &quot;{searchText}&quot;.
                </p>
              ) : searchText.length === 0 && !loading ? (
                <p className="text-center text-gray-400">
                  Start typing to search for books...
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashBoard;
