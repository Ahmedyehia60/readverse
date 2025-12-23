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
      <h1 className="text-3xl font-black mb-16 flex items-center gap-3 bg-clip-text text-transparent bg-linear-to-r from-gray-600 to-cyan-400 text-center justify-center">
        <span className="text-yellow-400 text-4xl">⭐</span> Favourite List
      </h1>

      {favorites.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">
          Your cosmic library is empty.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-16">
          {favorites.map((book, index) => (
            <motion.div
              key={index}
              className="relative flex flex-col items-center group"
            >
              <div className="relative w-64 h-48 flex items-center justify-center">
                <div className="absolute w-40 h-[60px] border-[1.2px] border-purple-500/40 rounded-[100%] rotate-[-15deg] z-0" />

                <div className="absolute w-40 h-40  pointer-events-none animate-orbit-ellipse">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-purple-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                </div>

                <div className="relative z-10 w-20 h-28 transition-all duration-500 group-hover:scale-105 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={book.bookImage || "/placeholder.png"}
                    className="w-full h-full object-cover rounded-sm border border-white/10"
                    alt={book.bookTitle}
                  />
                </div>
              </div>

              <div className="mt-4 text-center max-w-40">
                <h3 className="text-[12px] font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
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

      <style jsx global>{`
        .animate-orbit-ellipse {
          animation: orbit 8s linear infinite;
          transform-origin: center center;
          transform: scaleY(0.37) rotate(-15deg);
        }

        @keyframes orbit {
          from {
            transform: scaleY(0.37) rotate(0deg);
          }
          to {
            transform: scaleY(0.37) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
