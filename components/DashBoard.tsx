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
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);

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
    const MAX_BOOKS_PER_CATEGORY = 5;
    let fullCategoriesCount = 0;
    mindMap.forEach((existingCat) => {
      let currentCount = existingCat.books.length;
      const isBookInThisCat = categories.some(
        (newCat) => newCat.toLowerCase() === existingCat.name.toLowerCase()
      );
      if (isBookInThisCat) {
        currentCount += 1;
      }

      if (currentCount >= MAX_BOOKS_PER_CATEGORY) {
        fullCategoriesCount++;
      }
    });

    if (fullCategoriesCount >= 2) {
      console.log(
        "⚠️ Alert: Two or more categories have reached the limit (5+ books)!"
      );
    }
    // ========================================================
    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, categories }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(`Book "${title}" added successfully!`);
      fetchMindMap();
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
              top: `${cat.y * 100}%`,
              left: `${cat.x * 100}%`,
            }}
            className="flex flex-col items-center gap-0 cursor-pointer
               hover:scale-105 transition"
            onClick={() => setActiveCategory(cat)}
          >
            {/* Category Name */}
            <p className="text-xs text-white text-center max-w-[110px] truncate">
              {cat.name}
            </p>

            {/* Image */}
            <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-lg">
              <img
                src={cat.image || "/placeholder.png"}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Book Title */}
            <p className="text-xs text-white text-center max-w-[110px] truncate opacity-80">
              {cat.books[cat.books.length - 1]?.title}
            </p>
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
      style={{ backgroundImage: "url('/Images/galaxy4.jpg')" }}
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
      {activeCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
               bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveCategory(null)}
        >
          <div
            className="flex gap-6 p-6 rounded-2xl max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGE */}
            <div className="w-1/2 flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Ripple rings */}
                <div className="ripple absolute w-44 h-44 rounded-full border border-white/10"></div>
                <div className="ripple absolute w-52 h-52 rounded-full border border-white/10"></div>
                <div className="ripple absolute w-60 h-60 rounded-full border border-white/10"></div>

                {/* Image */}
                <img
                  src={activeCategory.image || "/placeholder.png"}
                  alt={activeCategory.name}
                  className="w-full h-full object-cover rounded-full z-10"
                />
              </div>

              {/* Category name */}
              <h2 className="mt-6 text-lg font-semibold text-center">
                {activeCategory.name}
              </h2>
            </div>

            {/* BOOK LIST */}
            <div className="w-1/2 max-h-[400px] overflow-y-auto">
              <h3 className="mb-3 text-sm text-gray-300">Books</h3>

              <ul className="space-y-2">
                {activeCategory.books.map((book, index) => (
                  <li
                    key={index}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20
                         transition cursor-pointer text-sm"
                  >
                    {book.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
