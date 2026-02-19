/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import { useNotifications } from "@/context/NotficationContext";
import { INotification } from "@/models/users";
import { ArrowRight, Sparkles, Bell, Trophy, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Inbox() {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("Notifications");
  const s = useTranslations("Settings");
  const s_profile = useTranslations("Profile");
  const s_smartLink = useTranslations("Notifications.smartLink");

  const handleNotificationClick = async (note: INotification) => {
    if (!note.isRead && markAsRead) {
      await markAsRead(note.id);
    }

    if (note.type === "achievement") {
      router.push("/Profile");
    } else {
      router.push(`/?highlight=${encodeURIComponent(note.bookTitle || "")}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020106] p-8 text-white selection:bg-[#4c3ba8]/30">
      <button
        onClick={() => router.back()}
        className="group mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
      >
        <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-[#4c3ba8]/50 group-hover:bg-[#4c3ba8]/20 transition-all">
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform rtl:-scale-x-100"
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.2em]">
          {s("back")}
        </span>
      </button>
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic uppercase">
              <Sparkles className="text-[#4c3ba8]" size={28} />
              {t("title")}
            </h1>
            <p className="text-gray-500 text-[10px] mt-2 font-mono tracking-[0.3em] uppercase opacity-70">
              {t("description")}
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest cursor-pointer border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5"
          >
            {t("clear")}
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
                      ? "border-white/5 bg-white/1"
                      : "border-white/10 bg-white/3 hover:border-[#4c3ba8]/40 hover:bg-[#4c3ba8]/5 shadow-lg shadow-purple-900/5"
                  }`}
              >
                <div className="flex gap-6 items-start relative z-10">
                  {note.type === "achievement" ? (
                    <div
                      className={`p-4 rounded-xl border shrink-0 transition-all duration-500 
                      ${
                        note.isRead
                          ? "border-white/5 bg-white/5 opacity-50"
                          : "border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.1)] group-hover:scale-105"
                      }`}
                    >
                      <Trophy
                        className={
                          note.isRead ? "text-gray-500" : "text-yellow-500"
                        }
                        size={32}
                      />
                    </div>
                  ) : (
                    note.bookImage && (
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
                    )
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter transition-colors
                        ${
                          note.isRead
                            ? "bg-white/10 text-gray-500"
                            : note.type === "achievement"
                              ? "bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,0.3)]"
                              : "bg-[#4c3ba8] text-white shadow-[0_0_10px_rgba(76,59,168,0.3)]"
                        }`}
                      >
                        {note.isRead
                          ? t("status.archived")
                          : note.type === "achievement"
                            ? t("status.achievement")
                            : t("status.newSignal")}
                      </span>
                    </div>
                    <h3
                      className={`text-xl font-bold mb-1 tracking-tight transition-colors ${
                        note.isRead ? "text-gray-400" : "text-white"
                      }`}
                    >
                      {note.type === "achievement"
                        ? t("achievement.promotionTitle")
                        : note.type === "smart-link"
                          ? s_smartLink("title")
                          : note.title || note.bookTitle || "Incoming Data"}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed mb-4 max-w-2xl transition-colors ${
                        note.isRead ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      {note.type === "achievement"
                        ? t("achievement.promotionMessage", {
                            name: session?.user?.name || "Commander",
                            rank: s_profile(`${note.categories?.[0]}`),
                          })
                        : note.type === "smart-link"
                          ? s_smartLink("message", {
                              cat1: note.categories?.[0] || "",
                              cat2: note.categories?.[1] || "",
                            })
                          : note.message}
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
                            {note.type === "achievement"
                              ? s_profile(`${note.categories[0]}`)
                              : note.categories[0]}
                          </span>

                          {note.categories[1] && (
                            <>
                              <ArrowRight size={10} className="opacity-20" />
                              <span
                                className={`uppercase ${
                                  note.isRead
                                    ? "text-gray-700"
                                    : note.type === "achievement"
                                      ? "text-yellow-500"
                                      : "text-[#4c3ba8]"
                                }`}
                              >
                                {note.type === "achievement"
                                  ? s_profile(
                                      `ranks.labels.${note.categories[1]}`,
                                    )
                                  : note.categories[1]}
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
                    {note.isRead ? t("actions.open") : t("actions.engage")}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-4xl opacity-30">
              <Bell size={40} className="mb-4 text-gray-600" />
              <p className="font-bold text-sm uppercase tracking-[0.4em]">
                {t("empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
