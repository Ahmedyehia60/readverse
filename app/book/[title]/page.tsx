/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SidebarIcon from "@/components/SideBarIcon";
import Loader from "@/components/Loader";
import { motion } from "framer-motion";
import { BookOpen, Star, Globe, Layers, Calendar } from "lucide-react";

export default function BookDetailsPage() {
  const params = useParams();
  const title = params.title as string;
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookInfo = async () => {
      try {
        const decodedTitle = decodeURIComponent(title);
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${decodedTitle}`
        );
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setBook(data.items[0].volumeInfo);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (title) fetchBookInfo();
  }, [title]);

  if (loading)
    return (
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Scanning the Nebula..."
      />
    );

  if (!book)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0a061e]">
        Lost in Space.
      </div>
    );

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-[#050212]">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <SidebarIcon active="" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group mx-auto lg:mx-0"
          >
            <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative w-64 md:w-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={
                  book.imageLinks?.extraLarge ||
                  book.imageLinks?.thumbnail ||
                  "/placeholder.png"
                }
                alt={book.title}
                className="w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <div className="space-y-2 mb-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                {book.title}
              </h1>
              <div className="flex flex-wrap gap-2 pt-2">
                {book.authors?.map((a: string) => (
                  <span
                    key={a}
                    className="text-purple-400 font-medium tracking-widest text-sm uppercase px-1"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Calendar size={14} className="text-purple-400" />
                <span className="text-xs text-gray-300">
                  {book.publishedDate || "Unknown Orbit"}
                </span>
              </div>
              <div className="w-12 h-px bg-white/20" />
              <span className="text-xs text-gray-500 tracking-[0.2em] uppercase">
                {book.publisher || "Independent Discovery"}
              </span>
            </div>

            <div className="relative group mb-10">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-purple-200">
                <BookOpen size={18} /> LOG_ENTRY:
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg font-light max-w-2xl border-l-2 border-purple-500/30 pl-6 py-2">
                {book.description?.replace(/<[^>]*>?/gm, "") ||
                  "Data corrupted. No description available for this cosmic entity."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              <InfoCard
                label="Extent"
                value={`${book.pageCount || "???"} Pages`}
                icon={<Layers size={20} />}
              />
              <InfoCard
                label="Rating"
                value={
                  book.averageRating ? `${book.averageRating}/5` : "Unrated"
                }
                icon={<Star size={20} className="text-yellow-500" />}
              />
              <InfoCard
                label="Origin"
                value={book.language || "EN"}
                icon={<Globe size={20} />}
              />
              <InfoCard
                label="Sector"
                value={book.categories?.[0] || "Unknown"}
                icon={<BookOpen size={20} />}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="relative overflow-hidden group p-4 rounded-2xl bg-white/3 border border-white/10 hover:bg-white/8 transition-all duration-300">
      <div className="text-purple-500/50 mb-3 group-hover:text-purple-400 transition-colors">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-lg font-bold truncate text-white/90">{value}</p>
    </div>
  );
}
