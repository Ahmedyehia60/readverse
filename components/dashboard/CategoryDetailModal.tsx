/* eslint-disable @next/next/no-img-element */
"use client";
import { ICategory, IFavorite } from "@/models/users";
import { Star, Trash2, X, AlertTriangle, Atom, Book } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  category: ICategory | null;
  favorites: IFavorite[];
  setFavorites: React.Dispatch<React.SetStateAction<IFavorite[]>>;
  onClose: () => void;
  onDeleteBook: (categoryName: string, bookTitle: string) => Promise<void>;
  onDeleteCategory: (categoryName: string) => Promise<void>;
}

export const CategoryDetailModal = ({
  category,
  favorites,
  setFavorites,
  onClose,
  onDeleteBook,
  onDeleteCategory,
}: Props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCatDeleteConfirm, setShowCatDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{
    categoryName: string;
    bookTitle: string;
  } | null>(null);

  if (!category) return null;

  // ================== Functions ==========================

  const openConfirmDelete = (bookTitle: string) => {
    setBookToDelete({
      categoryName: category.name,
      bookTitle: bookTitle,
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (bookToDelete) {
      await onDeleteBook(bookToDelete.categoryName, bookToDelete.bookTitle);
      setShowDeleteModal(false);
      setBookToDelete(null);
    }
  };

  const isFavorite = (bookTitle: string) =>
    Array.isArray(favorites) &&
    favorites.some((fav) => fav.bookTitle === bookTitle);

  const toggleFavorite = async (bookTitle: string) => {
    const isFav = isFavorite(bookTitle);

    if (isFav) {
      setFavorites((prev) => prev.filter((fav) => fav.bookTitle !== bookTitle));
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle }),
      });
      return;
    }

    try {
      const googleRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
          bookTitle
        )}`
      );
      const googleData = await googleRes.json();
      const info = googleData.items?.[0]?.volumeInfo;

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle,
          bookImage: info?.imageLinks?.thumbnail || null,
          bookAuthors: info?.authors || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites);
      }
    } catch (err) {
      console.error("Error fetching book details:", err);
    }
  };

  return (
    <>
      {/* Main Modal Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl cursor-default"
        onClick={onClose}
      >
        <div
          className="flex flex-col md:flex-row gap-10 p-1 rounded-[2.5rem] max-w-4xl w-full mx-4 relative overflow-hidden bg-gradient-to-b from-white/10 to-transparent shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          {/* Delete Category Button */}
          <button
            onClick={() => setShowCatDeleteConfirm(true)}
            className="absolute top-8 left-8 z-20 p-2.5 text-red-500/40 hover:text-red-500 transition-all bg-white/5 hover:bg-red-500/10 rounded-full border border-white/5 cursor-pointer group"
          >
            <Trash2
              size={18}
              className="group-hover:rotate-12 transition-transform"
            />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-20 p-2 text-gray-500 hover:text-white transition-all bg-white/5 rounded-full border border-white/5 cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Left Side: Ripples and Image */}
          <div className="w-full md:w-[45%] flex flex-col items-center justify-center py-12 px-6 z-10 relative">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full border border-purple-500/30 animate-[ping_3s_linear_infinite]"></div>
              <div className="absolute w-[130%] h-[130%] rounded-full border border-blue-500/20 animate-[ping_4s_linear_infinite]"></div>
              <div className="absolute w-[160%] h-[160%] rounded-full border border-white/5 animate-[ping_5s_linear_infinite]"></div>
              <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-2xl animate-pulse"></div>

              <img
                src={category.image || "/placeholder.png"}
                alt={category.name}
                className="w-full h-full object-cover rounded-full z-10 border-4 border-white/10 shadow-2xl relative"
              />
            </div>

            <div className="mt-12 text-center">
              <span className="text-[10px] tracking-[0.4em] text-purple-400 uppercase font-bold opacity-70">
                Category Sector
              </span>
              <h2 className="text-4xl font-black text-white mt-2 capitalize tracking-tight italic">
                {category.name}
              </h2>
              <div className="h-1 w-12 bg-linear-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </div>

          {/* Right Side: Books List */}
          <div className="w-full md:w-[55%] bg-white/3 backdrop-blur-2xl p-8 md:p-12 z-10 border-t md:border-t-0 md:border-l border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <Atom size={16} className="text-purple-400 animate-spin-slow" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Stored Data Links
              </h3>
            </div>

            <ul className="space-y-4 max-h-[380px] overflow-y-auto pr-4 custom-scrollbar">
              {category.books.map((book, index) => (
                <li
                  key={index}
                  className="group relative p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center"
                >
                  <div className="w-1 h-0 group-hover:h-8 bg-purple-500 absolute left-0 transition-all duration-300 rounded-full"></div>

                  <Link
                    href={`/book/${encodeURIComponent(book.title)}`}
                    className="flex-1 text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate cursor-pointer pr-4"
                  >
                    {book.title}
                  </Link>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => toggleFavorite(book.title)}
                      className={`transition-all hover:scale-125 cursor-pointer ${
                        isFavorite(book.title)
                          ? "text-yellow-400"
                          : "text-gray-500 hover:text-yellow-400"
                      }`}
                    >
                      <Star
                        size={16}
                        fill={isFavorite(book.title) ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => openConfirmDelete(book.title)}
                      className="text-gray-500 hover:text-red-500 transition-all hover:scale-125 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Category Purge (Category Delete) */}
      {showCatDeleteConfirm && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-2xl cursor-default"
          onClick={() => setShowCatDeleteConfirm(false)}
        >
          <div
            className="bg-[#050505] border border-red-500/20 p-10 rounded-4xl max-w-sm w-full mx-4 shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex p-4 rounded-full bg-red-500/5 mb-6 border border-red-500/10">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
              System Purge
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to erase the entire{" "}
              <span className="text-red-400 font-mono">[{category.name}]</span>{" "}
              sector? All connections will be lost.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-6 font-bold cursor-pointer"
                onClick={async () => {
                  await onDeleteCategory(category.name);
                  setShowCatDeleteConfirm(false);
                }}
              >
                Confirm Deletion
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-white cursor-pointer"
                onClick={() => setShowCatDeleteConfirm(false)}
              >
                Abort Mission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Object Removal (Book Delete) - Now same style as above! */}
      {showDeleteModal && bookToDelete && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-2xl cursor-default"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-[#050505] border border-red-500/20 p-10 rounded-4xl max-w-sm w-full mx-4 shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex p-4 rounded-full bg-purple-500/5 mb-6 border border-purple-500/20">
              <Trash2 className="text-purple-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
              Eject Object
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Do you want to unlink{" "}
              <span className="text-purple-400 font-mono">
                [{bookToDelete.bookTitle}]
              </span>{" "}
              from this coordinate?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-6 font-bold cursor-pointer transition-all active:scale-95"
                onClick={handleConfirmDelete}
              >
                Confirm Removal
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-white cursor-pointer"
                onClick={() => {
                  setShowDeleteModal(false);
                  setBookToDelete(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
