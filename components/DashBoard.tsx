"use client";
import { Button } from "@/components/ui/button";
import { Home, Layers, Search, Star, User, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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

// ----------------------------------------------------

function DashBoard() {
  const [showBar, setShowBar] = useState(false);
  const [activeIcon, setActiveIcon] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const icons = [
    { id: "user", icon: User, name: "Profile" },
    { id: "star", icon: Star, name: "Favorites" },
    { id: "layers", icon: Layers, name: "Categories" },
  ];

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

  // Debouncing Logic
  useEffect(() => {
    if (!showModal) return;

    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, showModal, handleSearch]);

  const handleToggleBar = () => {
    setActiveIcon("home");
    setShowBar((prev) => !prev);
  };

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      {/* 1. Add Book Button */}
      <Button
        className="absolute top-4 right-4 p-5 bg-[#2B1B72] text-white hover:bg-blue-800 z-10"
        onClick={() => setShowModal(true)}
      >
        Add Book
      </Button>

      {/* 2. Side Bar (شريط الأيقونات الجانبي) */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 border-3 border-[#2B1B72] py-4 px-2 rounded-lg">
        {/* Toggle Button (Home Icon) */}
        <Button
          className={`p-3 rounded-full backdrop-blur-sm cursor-pointer transition my-3 ${
            activeIcon === "home"
              ? "bg-[#2B1B72] hover:bg-[#2B1B72]"
              : "bg-white/10 hover:bg-white/20"
          }`}
          onClick={handleToggleBar}
        >
          <Home className="w-3 h-3 text-white" />
        </Button>

        {/* Icons الفرعية */}
        {showBar &&
          icons.map(({ id, icon: Icon }) => (
            <div
              key={id}
              onClick={() => setActiveIcon(id)}
              className={`
                p-3 rounded-full backdrop-blur-sm cursor-pointer transition my-3
                ${
                  activeIcon === id
                    ? "bg-[#2B1B72]"
                    : "bg-white/10 hover:bg-white/20"
                }
              `}
            >
              <Icon className="w-3 h-3 text-white mx-auto" />
            </div>
          ))}
      </div>

      {/* 3. Search Modal */}
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

            {/* شريط البحث */}
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

            {/* منطقة عرض النتائج */}
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
                  No books found matching "{searchText}".
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
