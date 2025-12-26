/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import { useNotifications } from "@/context/NotficationContext";
import { INotification } from "@/models/users";
import { ArrowRight, Sparkles, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Inbox() {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = (note: INotification) => {
    if (!note.isRead && markAsRead) {
      markAsRead(note.id);
    }
    router.push(`/?highlight=${encodeURIComponent(note.bookTitle || "")}`);
  };

  return (
    <div className="min-h-screen bg-[#020106] p-8 text-white selection:bg-[#4c3ba8]/30">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic uppercase">
              <Sparkles className="text-[#4c3ba8]" size={28} />
              Galactic Log
            </h1>
            <p className="text-gray-500 text-[10px] mt-2 font-mono tracking-[0.3em] uppercase opacity-70">
              Data Transmissions
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest cursor-pointer border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Clear All
          </button>
        </header>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((note: INotification) => (
              <div
                key={note.id}
                className={`relative overflow-hidden group border transition-all duration-300 p-5 rounded-2xl
                  ${
                    note.isRead
                      ? "border-white/5 bg-white/[0.01]"
                      : "border-white/10 bg-white/[0.03] hover:border-[#4c3ba8]/40 hover:bg-[#4c3ba8]/5 shadow-lg shadow-purple-900/5"
                  }`}
              >
                <div className="flex gap-6 items-start relative z-10">
                  {note.bookImage && (
                    <div className="relative shrink-0">
                      <img
                        src={note.bookImage}
                        className={`w-16 h-24 object-cover rounded-xl shadow-2xl border border-white/10 transition-all duration-500
                          ${
                            note.isRead
                              ? "opacity-60 grayscale-[0.5]"
                              : "group-hover:scale-105 group-hover:border-[#4c3ba8]/50"
                          }`}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter transition-colors
                        ${
                          note.isRead
                            ? "bg-white/10 text-gray-500"
                            : "bg-[#4c3ba8] text-white shadow-[0_0_10px_rgba(76,59,168,0.3)]"
                        }`}
                      >
                        {note.isRead ? "Archived" : "New Signal"}
                      </span>
                    </div>

                    <h3
                      className={`text-xl font-bold mb-1 tracking-tight transition-colors ${
                        note.isRead ? "text-gray-400" : "text-white"
                      }`}
                    >
                      {note.bookTitle || "Incoming Data"}
                    </h3>

                    <p
                      className={`text-sm leading-relaxed mb-4 max-w-2xl transition-colors ${
                        note.isRead ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      {note.message}
                    </p>

                    {note.categories && note.categories.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-bold transition-colors
                          ${
                            note.isRead
                              ? "border-white/5 text-gray-600"
                              : "border-white/10 bg-white/5 text-indigo-300"
                          }`}
                        >
                          <span className="uppercase">
                            {note.categories[0]}
                          </span>
                          {note.categories[1] && (
                            <>
                              <ArrowRight size={10} className="opacity-20" />
                              <span
                                className={`uppercase ${
                                  note.isRead
                                    ? "text-gray-700"
                                    : "text-[#4c3ba8]"
                                }`}
                              >
                                {note.categories[1]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className={`shrink-0 self-center px-6 py-2.5 rounded-xl text-[10px] font-black transition-all border cursor-pointer uppercase tracking-widest
                      ${
                        note.isRead
                          ? "bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30"
                          : "bg-white text-black hover:bg-[#4c3ba8] hover:text-white hover:shadow-[0_0_20px_rgba(76,59,168,0.4)]"
                      }`}
                    onClick={() => handleNotificationClick(note)}
                  >
                    {note.isRead ? "Open" : "Engage"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-4xl opacity-30">
              <Bell size={40} className="mb-4 text-gray-600" />
              <p className="font-bold text-sm uppercase tracking-[0.4em]">
                Silence in this Sector
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
