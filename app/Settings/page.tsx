"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Settings,
  Moon,
  Sun,
  Lock,
  ChevronRight,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import SidebarIcon from "@/components/SideBarIcon";

export default function SettingsPage() {
  const [language, setLanguage] = useState("EN");
  const [isDeepSpace, setIsDeepSpace] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  

  // ======================================== LOGIC ========================================

  const cancelDelete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsModalOpen(false);
    setCountdown(5);
    setIsDeleting(false);
  }, []);

  const handleFinalDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/deleteGalaxy", {
        method: "POST",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("System failure: Shields are too strong.");
        cancelDelete();
      }
    } catch (error) {
      console.error("Critical error:", error);
      cancelDelete();
    }
  }, [cancelDelete]);

  useEffect(() => {
    if (isModalOpen && countdown > 0 && !isDeleting) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !isDeleting) {
      if (timerRef.current) clearInterval(timerRef.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleFinalDelete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isModalOpen, countdown, isDeleting, handleFinalDelete]);

  const startSelfDestruct = () => {
    setIsModalOpen(true);
    setCountdown(5);
  };

  // ======================================== RENDER ========================================

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-700 ${
        isDeepSpace ? "bg-[#0b081a]" : "bg-[#1a0b2e]"
      } text-white p-6 lg:pl-24 relative overflow-x-hidden`}
    >
      <div
        className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] transition-all duration-1000 rounded-full pointer-events-none blur-[120px] 
        ${isDeepSpace ? "bg-indigo-600/10" : "bg-pink-600/10"}`}
      ></div>

      <SidebarIcon active="settings" />

      <div className="max-w-3xl mx-auto mt-12 relative z-10">
        <div className="flex items-center gap-5 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="p-4 bg-white/5 rounded-4xl border border-white/10 shadow-xl">
            <Settings
              className={isDeepSpace ? "text-indigo-400" : "text-pink-400"}
              size={32}
            />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight uppercase leading-none">
              Settings
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.4em] font-bold uppercase mt-2">
              Control Panel
            </p>
          </div>
        </div>

        <div className="space-y-6 pb-20">
          <section className="bg-[#120d2b]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-white/10">
            <h2 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Sparkles size={14} /> Interface
            </h2>

            <div className="space-y-10">
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[15px] font-bold tracking-tight">
                    Galaxy Environment
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
                    Theme: {isDeepSpace ? "Deep Space" : "Nebula"}
                  </p>
                </div>

                <button
                  onClick={() => setIsDeepSpace(!isDeepSpace)}
                  className={`w-20 h-10 rounded-full p-1 transition-all duration-500 flex items-center border shadow-inner
                    ${
                      isDeepSpace
                        ? "bg-indigo-900/40 border-indigo-500/30"
                        : "bg-pink-900/40 border-pink-500/30"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform shadow-lg
                    ${
                      isDeepSpace
                        ? "translate-x-0 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        : "translate-x-10 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                    }`}
                  >
                    {isDeepSpace ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5 group">
                <div>
                  <p className="text-[15px] font-bold tracking-tight text-white/90">
                    Uplink Language
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
                    Protocol: {language === "EN" ? "English" : "Arabic"}
                  </p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 relative w-24 h-10 overflow-hidden shadow-inner">
                  <div
                    className={`absolute top-1 bottom-1 w-11 bg-white/10 rounded-xl transition-all duration-300 ease-out ${
                      language === "EN" ? "left-1" : "left-[47px]"
                    }`}
                  />
                  <button
                    onClick={() => setLanguage("EN")}
                    className={`relative z-10 flex-1 text-[10px] font-black transition-colors ${
                      language === "EN" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage("AR")}
                    className={`relative z-10 flex-1 text-[10px] font-black transition-colors ${
                      language === "AR" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    AR
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#120d2b]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-emerald-500/10">
            <h2 className="text-[11px] font-extrabold text-emerald-500/80 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Lock size={14} className="text-emerald-500" /> Security Clearance
            </h2>

            <button className="w-full flex items-center justify-between p-5 rounded-2xl transition-all group border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-all duration-300">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[15px] font-bold tracking-tight text-emerald-50">
                    Update Access Keys
                  </p>
                  <p className="text-[11px] text-emerald-500/50 mt-1 uppercase tracking-wider font-black">
                    Change Password
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ChevronRight size={18} />
              </div>
            </button>
          </section>

          <section className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 mt-10 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-[11px] font-extrabold text-red-500 uppercase tracking-[0.3em] mb-2 flex items-center justify-center sm:justify-start gap-2">
                  <AlertCircle size={14} /> Critical Action
                </h2>
                <p className="text-[15px] font-bold text-red-100 tracking-tight">
                  Initiate Self-Destruct
                </p>
                <p className="text-[11px] text-red-500/60 uppercase mt-1 tracking-wider font-bold leading-relaxed">
                  Collapses your entire universe and erases all data
                </p>
              </div>
              <button
                onClick={startSelfDestruct}
                className="w-full sm:w-auto px-10 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-2xl text-[11px] font-extrabold tracking-widest transition-all uppercase shadow-lg active:scale-95"
              >
                Terminate Galaxy
              </button>
            </div>
          </section>

          <div className="pt-8 flex flex-col items-center opacity-30">
            <div className="flex items-center gap-2 text-gray-400">
              <Info size={12} />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.4em]">
                Build 1.0.4 - System Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0b081a] border border-red-500/30 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-[0_0_80px_rgba(239,68,68,0.15)] animate-in zoom-in duration-300 border-t-red-500/60">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
              <span className="text-4xl font-black text-red-500 relative z-10">
                {countdown}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter mb-3 leading-none text-center">
              Total Collapse
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-10 leading-relaxed text-center">
              Your galaxy will be erased in {countdown} seconds. <br /> This
              action is permanent.
            </p>

            <button
              onClick={cancelDelete}
              className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 text-white"
            >
              Abort Mission
            </button>

            <p className="text-[8px] text-red-500/40 font-black uppercase tracking-widest mt-6 animate-pulse text-center">
              System: Waiting for manual override...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
