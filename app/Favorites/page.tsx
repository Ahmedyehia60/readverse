"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [favorites, setFavorites] = useState<string[]>([]);
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⭐ Favorite Books</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-400">No favorite books yet.</p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((book, index) => (
            <li
              key={index}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              {book}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
