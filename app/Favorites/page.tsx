"use client";


import { useEffect, useState } from "react";
import { IFavorite } from "@/models/users";
import { motion } from "framer-motion";
import SidebarIcon from "@/components/SideBarIcon";
import Loader from "@/components/Loader";

export default function Page() {
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [loading, setLoading] = useState(true);

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
      className="min-h-screen p-10 text-white bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <SidebarIcon active="star" />

      <div className="mb-16 text-left">
        <h1 className="text-3xl font-black flex items-center justify-start gap-3 bg-clip-text  bg-linear-to-r text-white/90">
          Favourite List
        </h1>

        <p className="mt-2 text-xl text-white/80">
          Stories that earned a place in your orbit
        </p>
      </div>

      {favorites.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">
          Your cosmic library is empty.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-20">
          {favorites.map((book, index) => (
            <motion.div
              key={index}
              className="relative flex flex-col items-center group"
            >
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
                      path="
                        M 15 55
                        a 95 35 -13 1 0 190 0
                        a 95 35 -13 1 0 -190 0
                      "
                    />
                  </circle>
                </svg>

                <div className="relative z-10 w-34 h-50 transition-all duration-500 group-hover:scale-105 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.bookImage || "/placeholder.png"}
                    className="w-full h-full object-cover rounded-sm border border-white/10"
                    alt={book.bookTitle}
                  />
                </div>
              </div>

              <div className="mt-5 text-center max-w-44">
                <h3 className="text-[13px] font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                  {book.bookTitle}
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                  {book.bookAuthors?.[0] || "Unknown Author"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
