/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { IFavorite } from "@/models/users";
import { motion, AnimatePresence } from "framer-motion";
import SidebarIcon from "@/components/SideBarIcon";
import Loader from "@/components/Loader";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Page() {
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Favourite");
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/favorites", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleDelete = async (bookTitle: string) => {
    try {
      setFavorites((prev) =>
        prev.filter((book) => book.bookTitle !== bookTitle)
      );

      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle }),
      });

      if (!res.ok) throw new Error("Failed to delete from server");

      toast.success(`"${bookTitle}" removed from your orbit`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove book");
    }
  };

  if (loading)
    return (
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Loading worlds..."
      />
    );

  return (
    <div
      className="min-h-screen p-10 text-white  bg-repeat bg-center"
      style={{ backgroundImage: "url('/Images/galaxy5.jpg')" }}
    >
      <SidebarIcon active="star" />

      <div className="mb-16 text-start">
        <h1 className="text-3xl font-black flex items-center justify-start gap-3 bg-clip-text bg-linear-to-r text-white/90"></h1>
        {t("title")}
        <p className="mt-2 text-xl text-white/80">{t("description")}</p>
      </div>

      {favorites.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">{t("empty")}</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-20">
          <AnimatePresence mode="popLayout">
            {favorites.map((book) => (
              <motion.div
                key={book.bookTitle}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                className="relative flex flex-col items-center group"
              >
                <button
                  onClick={() => handleDelete(book.bookTitle)}
                  className="absolute top-0 right-4 z-30 p-2 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-md border border-red-500/30 shadow-lg shadow-red-500/20"
                >
                  <Trash2 size={16} />
                </button>

                <div className="relative w-72 h-56 flex items-center justify-center">
                  <svg
                    width="240"
                    height="110"
                    viewBox="0 0 220 110"
                    className="absolute"
                  >
                    <ellipse
                      cx="110"
                      cy="55"
                      rx="120"
                      ry="45"
                      fill="none"
                      stroke="rgba(168,85,247,0.4)"
                      strokeWidth="1.4"
                      transform="rotate(-13 110 55)"
                    />
                    <circle r="4.5" fill="#a855f7">
                      <animateMotion
                        dur="7s"
                        repeatCount="indefinite"
                        path="M 15 55 a 95 35 -13 1 0 190 0 a 95 35 -13 1 0 -190 0"
                      />
                    </circle>
                  </svg>

                  <Link
                    href={`/book/${encodeURIComponent(book.bookTitle)}`}
                    className="relative z-10 w-34 h-50 block transition-all duration-500 group-hover:scale-110 shadow-2xl cursor-pointer"
                  >
                    <img
                      src={book.bookImage || "/placeholder.png"}
                      className="w-full h-full object-cover rounded-sm border border-white/10"
                      alt={book.bookTitle}
                    />
                  </Link>
                </div>

                <div className="mt-5 text-center max-w-44">
                  <Link href={`/book/${encodeURIComponent(book.bookTitle)}`}>
                    <h3 className="text-[13px] font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors cursor-pointer hover:underline">
                      {book.bookTitle}
                    </h3>
                  </Link>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                    {book.bookAuthors?.[0] || "Unknown Author"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
