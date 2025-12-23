"use client";
import { useEffect, useState } from "react";
import { IBridge } from "@/models/users";
import { ExternalLink, ArrowRight } from "lucide-react";

export default function BridgesPage() {
  const [bridges, setBridges] = useState<IBridge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBridges = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        setBridges(data.bridges || []);
      } catch (error) {
        console.error("Failed to fetch bridges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBridges();
  }, []);

  if (loading)
    return <div className="p-10 text-white">Loading Connections...</div>;

  return (
    <div
      className="min-h-screen  text-white p-8"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-500">
        Smart Connections (Bridges)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bridges.map((bridge) => (
          <div
            key={bridge.recommendedBook}
            className="bg-[#1a1438] border border-white/10 rounded-2xl p-5 hover:border-purple-500 transition-all shadow-xl"
          >
            <div className="flex items-center justify-between mb-4 bg-black/20 p-3 rounded-xl">
              <span className="text-purple-400 font-semibold">
                {bridge.fromCategory}
              </span>
              <ArrowRight size={16} className="text-white/40" />
              <span className="text-blue-400 font-semibold">
                {bridge.toCategory}
              </span>
            </div>

            <div className="flex gap-4">
              <div className="w-20 h-28 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bridge.bookImage || "/placeholder.png"}
                  alt={bridge.recommendedBook}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold leading-tight mb-2">
                    {bridge.recommendedBook}
                  </h3>
                  <p className="text-[10px] text-white/50">
                    This book connects your interest in {bridge.fromCategory}
                    and {bridge.toCategory}.
                  </p>
                </div>

                <a
                  href={bridge.bookLink}
                  target="_blank"
                  className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View Book <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bridges.length === 0 && (
        <div className="text-center py-20 text-white/30">
          No connections found yet. Add more books to discover smart links!
        </div>
      )}
    </div>
  );
}
