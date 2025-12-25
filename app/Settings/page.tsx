"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  Palette,
  Trash2,
  Lock,
  ChevronRight,
  AlertCircle,
  Info,
} from "lucide-react";
import SidebarIcon from "@/components/SideBarIcon";

export default function SettingsPage() {
  const [language, setLanguage] = useState("English");
  const [themeColor, setThemeColor] = useState("#6366f1"); // Indigo default

  return (
    <div className="min-h-screen bg-[#0b081a] text-white p-6 lg:pl-24 relative overflow-x-hidden">
      {/* Background Orbital Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <SidebarIcon active="settings" />

      <div className="max-w-3xl mx-auto mt-12 relative z-10">
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-12">
          <div className="p-4 bg-indigo-500/15 rounded-4xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Settings className="text-indigo-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              System Settings
            </h1>
            <p className="text-[10px] text-indigo-300/50 tracking-[0.4em] font-bold">
              GALACTIC COMMAND CENTER
            </p>
          </div>
        </div>

        <div className="space-y-8 pb-20">
          {/* Section 1: Appearance & Interface */}
          <section className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
              <Palette size={14} /> Visual Interface
            </h2>

            <div className="space-y-8">
              {/* Theme Color Selection */}
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold tracking-tight group-hover:text-indigo-300 transition-colors">
                    Galaxy Glow Color
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">
                    Adjust the primary neon accent of your universe
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-12 h-12 rounded-full bg-transparent border-2 border-white/10 cursor-pointer overflow-hidden p-0"
                  />
                  <div className="absolute inset-0 rounded-full pointer-events-none border border-white/20"></div>
                </div>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold tracking-tight group-hover:text-indigo-300 transition-colors">
                    Communication Protocol
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">
                    Select system interface language
                  </p>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500 transition cursor-pointer hover:bg-white/10"
                >
                  <option value="English" className="bg-[#120d2b]">
                    English (US)
                  </option>
                  <option value="Arabic" className="bg-[#120d2b]">
                    Arabic (EG)
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Security Clearance */}
          <section className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
              <Lock size={14} /> Security Protocols
            </h2>

            <button className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-emerald-500/5 transition-all group border border-transparent hover:border-emerald-500/10">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold tracking-tight">
                    Update Access Keys
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">
                    Change your account password
                  </p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </button>
          </section>

          {/* Section 3: System Information */}
          <section className="pt-8 flex flex-col items-center text-center opacity-40">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Info size={12} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                System Version 1.0.4 - Stable Build
              </p>
            </div>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
              Constructed for Cosmic Readers by Stellar Developers
            </p>
          </section>

          {/* Section 4: Danger Zone (Self-Destruct) */}
          <section className="bg-red-500/5 backdrop-blur-xl border border-red-500/10 rounded-[2.5rem] p-8 mt-12">
            <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
              <AlertCircle size={14} /> Critical Systems
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-red-500/5 rounded-3xl border border-red-500/10">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-red-100 tracking-tight">
                  Initiate Self-Destruct
                </p>
                <p className="text-[10px] text-red-500/60 uppercase mt-1">
                  Collapse all discovered planets and erase data
                </p>
              </div>
              <button className="w-full sm:w-auto px-10 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-2xl text-[10px] font-black tracking-widest transition-all active:scale-95 shadow-lg hover:shadow-red-600/20 uppercase">
                Terminate Galaxy
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
