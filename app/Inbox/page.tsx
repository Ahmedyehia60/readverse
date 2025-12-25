/* eslint-disable jsx-a11y/alt-text */
"use client";
import { useNotifications } from "@/context/NotficationContext";
import { INotification } from "@/models/users";
import { Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Inbox() {
  const { notifications, markAllAsRead } = useNotifications();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#020106] p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3">
            <Zap className="text-yellow-400 fill-yellow-400" /> GALACTIC LOG
          </h1>
          <button
            onClick={markAllAsRead}
            className="text-xs text-gray-500 hover:text-purple-400 uppercase tracking-widest cursor-pointer"
          >
            Clear Transmissions
          </button>
        </header>

        <div className="space-y-6">
          {notifications.map((note: INotification) => (
            <div
              key={note.id}
              className="relative overflow-hidden group border border-white/10 bg-white/5 backdrop-blur-xl p-6 rounded-2xl transition-all hover:border-purple-500/50 hover:bg-white/8"
            >
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-600/10 blur-[50px] group-hover:bg-purple-600/20" />

              <div className="flex gap-6 items-center">
                {note.bookImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={note.bookImage}
                    className="w-16 h-24 min-w-16 object-cover rounded-lg shadow-2xl shadow-purple-500/20"
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Bridge Established
                    </span>
                    {!note.isRead && (
                      <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">
                    {note.bookTitle || "New Connection Found"}
                  </h3>

                  <p className="text-sm text-gray-400 mb-3">{note.message}</p>

                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-blue-400 font-mono">
                      {note.categories?.[0]}
                    </span>
                    <ArrowRight size={14} />
                    <span className="text-pink-400 font-mono">
                      {note.categories?.[1]}
                    </span>
                  </div>
                </div>

                <button
                  className="bg-white/5 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm transition-all border border-white/10 cursor-pointer"
                  onClick={() => {
                    router.push(
                      `/?highlight=${encodeURIComponent(note.bookTitle || "")}`
                    );
                  }}
                >
                  View Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
