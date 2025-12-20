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
import { IBridge, ICategory } from "@/models/users";
import { Trash2 } from "lucide-react";

// ==================Types==========================
interface BookVolumeInfo {
  title: string;
  description?: string;
  infoLink?: string;
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

const MAX_BOOKS_PER_CATEGORY = 5;

// Find 2 random categories that reached max books
const getTwoRandomFullCategories = (
  mindMap: ICategory[],
  bookCategories: string[]
): ICategory[] | null => {
  const fullCategories = mindMap.filter((cat) => {
    let count = cat.books.length;
    const isBookInThisCat = bookCategories.some(
      (newCat) => newCat.toLowerCase() === cat.name.toLowerCase()
    );
    if (isBookInThisCat) count += 1;
    return count > 0 && count % MAX_BOOKS_PER_CATEGORY === 0;
  });

  if (fullCategories.length < 2) return null;

  const shuffled = [...fullCategories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};
// Fetch mapped books from API
const fetchMappedBooks = async (cat1: string, cat2: string) => {
  const res = await fetch(
    `/api/mapping?category1=${encodeURIComponent(
      cat1
    )}&category2=${encodeURIComponent(cat2)}`
  );
  if (!res.ok) throw new Error("Mapping API failed");
  return res.json();
};

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
  const [bridges, setBridges] = useState<IBridge[]>([]);
  const [mindMap, setMindMap] = useState<ICategory[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{
    categoryName: string;
    bookTitle: string;
  } | null>(null);

  // Fetch MindMap
  const fetchMindMap = async () => {
    const res = await fetch("/api/books", { method: "GET" });
    const data = await res.json();
    setMindMap(data.mindMap || []);
    setBridges(data.bridges || []);
  };

  useEffect(() => {
    fetchMindMap();
  }, []);

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setSearchResults(null);

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
    if (!showModal) return;
    const delayDebounceFn = setTimeout(() => handleSearch(searchText), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText, showModal, handleSearch]);

  // ==================Handle Add Book==========================
  const handleAddBook = async (book: BookItem) => {
    try {
      const payload = {
        title: book.volumeInfo.title,
        categories: book.volumeInfo.categories || [],
        image: book.volumeInfo.imageLinks?.thumbnail,
        author: book.volumeInfo.authors?.[0],
        link: book.volumeInfo.infoLink,
      };

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add book");
      }

      const data = await response.json();

      setMindMap(data.mindMap);
      const fullCats = getTwoRandomFullCategories(
        data.mindMap,
        payload.categories
      );

      if (fullCats) {
        const [c1, c2] = fullCats;
        const bridgeData = await fetchMappedBooks(c1.name, c2.name);
        if (bridgeData.books && bridgeData.books.length > 0) {
          const sortedBridge = [...bridgeData.books].sort(
            (a, b) => b.score - a.score
          );
          const recommended = sortedBridge[0];
          const recommendedTitle = recommended.volumeInfo.title;
          await fetch("/api/books", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromCategory: c1.name,
              toCategory: c2.name,
              recommendedBook: recommendedTitle,
            }),
          });
          setBridges((prev) => [
            ...prev,
            {
              fromCategory: c1.name,
              toCategory: c2.name,
              recommendedBook: recommendedTitle,
            },
          ]);
          setTimeout(() => {
            toast.info(`Smart Link Found!`, {
              description: `We found a connection: "${recommended.volumeInfo.title}" combines your interest in ${c1.name} and ${c2.name}.`,
              duration: 10000,
              action: {
                label: "View Book",
                onClick: () =>
                  window.open(recommended.volumeInfo.infoLink, "_blank"),
              },
            });
          }, 400);
        }
      }

      // Reset UI
      setShowModal(false);
      setSearchText("");
      toast.success("Book added to your mind map!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  //========================handle  delete book==========================
  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      const res = await fetch("/api/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookToDelete),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setMindMap(data.mindMap);
      setBridges(data.bridges);

      const updatedCategory = data.mindMap.find(
        (c: ICategory) => c.name === bookToDelete.categoryName
      );
      setActiveCategory(updatedCategory || null);

      toast.success("Book deleted");
    } catch {
      toast.error("Failed to delete book");
    } finally {
      setShowDeleteModal(false);
      setBookToDelete(null);
    }
  };

  // ==================Render MindMap==========================
  const renderMindMap = () => {
    if (!mindMap.length) return null;
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#8884d8" />
            </marker>
          </defs>
          {bridges.map((bridge, index) => {
            const cat1 = mindMap.find((c) => c.name === bridge.fromCategory);
            const cat2 = mindMap.find((c) => c.name === bridge.toCategory);

            if (!cat1 || !cat2) return null;
            const midX = ((cat1.x + cat2.x) / 2) * 100;
            const midY = ((cat1.y + cat2.y) / 2) * 100;

            return (
              <g key={index}>
                <line
                  x1={`${cat1.x * 100}%`}
                  y1={`${cat1.y * 100}%`}
                  x2={`${cat2.x * 100}%`}
                  y2={`${cat2.y * 100}%`}
                  stroke="#8884d8"
                  strokeWidth="0.7"
                  strokeDasharray="0"
                  markerEnd="url(#arrowhead)"
                  className="opacity-60 animate-pulse"
                />

                <text
                  x={`${midX}%`}
                  y={`${midY}%`}
                  fill="#ede7e7"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-medium italic select-none"
                  style={{ textShadow: "0px 0px 4px rgba(0,0,0,0.9)" }}
                >
                  {bridge.recommendedBook}
                  {bridge.bookImage && (
                    <tspan>
                      <image
                        x={`${midX}%`}
                        y={`${midY}%`}
                        href={bridge.bookImage}
                        width="10"
                        height="10"
                      />
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>

        {mindMap.map((cat) => (
          <div
            key={cat.name}
            style={{
              position: "absolute",
              top: `${cat.y * 100}%`,
              left: `${cat.x * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="flex flex-col items-center gap-0 cursor-pointer hover:scale-105 transition z-10"
            onClick={() => setActiveCategory(cat)}
          >
            <p className="text-xs text-white text-center max-w-[110px] truncate">
              {cat.name}
            </p>
            <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shadow-lg border-2 border-white/10">
              <img
                src={cat.image || "/placeholder.png"}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

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
                    className="flex items-center justify-between p-2 rounded-lg
       bg-white/10 hover:bg-white/20 transition-all duration-300
       text-sm group"
                  >
                    <span className="group-hover:opacity-80">{book.title}</span>

                    <Trash2
                      size={16}
                      className="text-red-400 opacity-0 group-hover:opacity-100
 hover:text-red-600 cursor-pointer transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookToDelete({
                          categoryName: activeCategory.name,
                          bookTitle: book.title,
                        });
                        setShowDeleteModal(true);
                      }}
                    />
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
      {showDeleteModal && bookToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
       bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-[#20193f] rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Confirm Delete
            </h3>

            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete
              <span className="text-white font-medium">
                &quot;{bookToDelete.bookTitle}&quot;
              </span>
              ؟
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
                onClick={() => {
                  setShowDeleteModal(false);
                  setBookToDelete(null);
                }}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteBook}
              >
                Delete
              </Button>
            </div>
          </div>
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
