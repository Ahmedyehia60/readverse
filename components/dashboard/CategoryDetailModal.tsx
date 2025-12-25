/* eslint-disable @next/next/no-img-element */
"use client";
import { ICategory, IFavorite } from "@/models/users";
import { Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  category: ICategory | null;
  favorites: IFavorite[];
  setFavorites: React.Dispatch<React.SetStateAction<IFavorite[]>>;
  onClose: () => void;
  onDeleteBook: (categoryName: string, bookTitle: string) => Promise<void>;
}

export const CategoryDetailModal = ({
  category,
  favorites,
  setFavorites,
  onClose,
  onDeleteBook,
}: Props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{
    categoryName: string;
    bookTitle: string;
  } | null>(null);

  if (!category) return null;

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

      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle }),
      });

      if (!res.ok) {
        const data = await res.json();
      }
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="flex flex-col md:flex-row gap-6 p-8 rounded-2xl max-w-3xl w-full mx-4  relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white  cursor-pointer"
          >
            <X size={24} />
          </button>
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="ripple absolute w-44 h-44 rounded-full border border-white/10 animate-ping"></div>
              <div className="ripple absolute w-52 h-52 rounded-full border border-white/5"></div>

              <img
                src={category.image || "/placeholder.png"}
                alt={category.name}
                className="w-full h-full object-cover rounded-full z-10 border-2 border-white/20"
              />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-center text-white">
              {category.name}
            </h2>
          </div>
          <div className="w-full md:w-1/2 max-h-[400px] overflow-y-auto pr-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-400">
              Books in this Category
            </h3>

            <ul className="space-y-3">
              {category.books.map((book, index) => (
                <li
                  key={index}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-sm text-gray-200 justify-between flex items-center group"
                >
                  <Link
                    href={`/book/${encodeURIComponent(book.title)}`}
                    className="flex-1 hover:text-purple-400 hover:underline transition-colors cursor-pointer"
                  >
                    {book.title}
                  </Link>

                  <div>
                    <button
                      onClick={() => toggleFavorite(book.title)}
                      className={`ml-2 p-1 transition-colors cursor-pointer ${
                        isFavorite(book.title)
                          ? "text-yellow-400"
                          : "text-gray-500 hover:text-yellow-500"
                      }`}
                      title="Toggle Favorite"
                    >
                      <Star
                        size={16}
                        fill={isFavorite(book.title) ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      onClick={() => openConfirmDelete(book.title)}
                      className="ml-2 p-1 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Book"
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

      {showDeleteModal && bookToDelete && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-[#20193f] rounded-xl p-6 w-full max-w-sm shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2 text-white">
              Confirm Delete
            </h3>

            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete
              <span className="text-red-400 font-bold px-1">
                &quot;{bookToDelete.bookTitle}&quot;
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => {
                  setShowDeleteModal(false);
                  setBookToDelete(null);
                }}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
