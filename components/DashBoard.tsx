/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
  Search,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "./SideBar";
import UserButton from "./UserButton";
import SidebarIcon from "./SideBarIcon";
import { toast } from "sonner";
import { ICategory } from "@/models/users";

// ==================Types==========================
interface BookVolumeInfo {
  title: string;
  authors?: string[];
  categories?: string[];
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
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showBar, setShowBar] = useState(false);

  // NEW: STATE TO STORE MINDMAP SHOWN IN UI
  // ---------------------------------------
  const [mindMap, setMindMap] = useState<ICategory[]>([]);

  // =============== Fetch MindMap from API =======================
  const fetchMindMap = async () => {
    const res = await fetch("/api/books", { method: "GET" });
    const data = await res.json();

    // UPDATE UI
    setMindMap(data.mindMap || []);
  };

  // FIRST LOAD FETCH MINDMAP
  // -------------------------
  useEffect(() => {
    fetchMindMap();
  }, []);

  // ===============Handlers=======================
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setSearchResults(null);

    const endpoint = `/api/search?q=${query}`;

    try {
      const response = await fetch(endpoint);
      const data: SearchResults = await response.json();

      setSearchResults(data.error ? { error: data.error } : data);
    } catch {
      setSearchResults({ error: "Failed to connect to search service." });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddBook = async (book: BookItem) => {
    const title = book.volumeInfo.title;
    const categories = Array.isArray(book.volumeInfo.categories)
      ? book.volumeInfo.categories
      : [];

    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, categories }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(`Book "${title}" added successfully!`);

      // REFRESH MINDMAP IN UI
      // -----------------------
      fetchMindMap(); // <= IMPORTANT FIX
    } else {
      toast.error(data.error);
    }

    setShowModal(false);
    setSearchResults(null);
    setSearchText("");
  };

  // ===============Render MindMap=======================
  const renderMindMap = () => {
    if (!mindMap.length) return null;

    return (
      <div className="relative w-full h-screen overflow-hidden">
        {mindMap.map((cat) => (
          <div
            key={cat.name}
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              top: `${cat.y}px`,
              left: `${cat.x}px`,
            }}
            className="rounded-xl overflow-hidden shadow-lg bg-black/30"
          >
            <div className="absolute top-0 bg-black/60 w-full py-1 px-1">
              <p className="text-xs text-center text-white truncate">
                {cat.name}
              </p>
            </div>
            <img
              src={cat.image || "/placeholder.png"}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  // ===============Debounce search input=======================
  useEffect(() => {
    if (!showModal) return;

    const delayDebounceFn = setTimeout(() => handleSearch(searchText), 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, showModal, handleSearch]);

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <UserButton className="absolute top-5 left-9 scale-110" />

      <Button
        className="absolute top-4 right-4 p-5 bg-[#2B1B72] text-white hover:bg-blue-900 z-10"
        onClick={() => setShowModal(true)}
      >
        Add Book
      </Button>

      {/* DISPLAY MINDMAP IN UI */}
      {/* ---------------------- */}
      {renderMindMap()}

      {/* SIDE BAR */}
      {showBar ? (
        <div className="hidden md:block">
          <AppSidebar />
          <ChevronsLeft
            className=" top-1/2 -translate-y-1/2 left-70 cursor-pointer z-10 fixed"
            onClick={() => setShowBar(false)}
          />
        </div>
      ) : (
        <div className="hidden md:block">
          <ChevronsRight
            className="absolute top-1/2 -translate-y-1/2 left-25 cursor-pointer"
            onClick={() => setShowBar(true)}
          />
          <SidebarIcon active="home" />
        </div>
      )}

      {/* SEARCH MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center 
          bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => {
            setShowModal(false);
            setSearchResults(null);
            setSearchText("");
          }}
        >
          <div
            className="bg-[#20193f] p-6 rounded-xl shadow-2xl w-full max-w-lg mx-4"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
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

              {/* SEARCH RESULTS */}
              {searchResults &&
              searchResults.items &&
              searchResults.items.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.items.map((book) => (
                    <li
                      key={book.id}
                      className="flex items-center p-2 rounded hover:bg-[#3C288D] transition cursor-pointer"
                      onClick={() => handleAddBook(book)}
                    >
                      <img
                        src={
                          book.volumeInfo.imageLinks?.smallThumbnail ||
                          "/placeholder.png"
                        }
                        alt={book.volumeInfo?.title || "Book cover"}
                        className="w-8 h-12 object-cover mr-3 rounded"
                      />
                      <div className="flex items-center w-full justify-between">
                        <div>
                          <p className="font-semibold text-sm">
                            {book.volumeInfo?.title || "No Title"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {book.volumeInfo.authors?.[0] || "Unknown Author"}
                          </p>
                        </div>
                        <CirclePlus className="text-gray-500 hover:text-green-500" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : searchResults && searchResults.error ? (
                <p className="text-center text-red-400">
                  Error: {searchResults.error}
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
