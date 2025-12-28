/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import SidebarIcon from "@/components/SideBarIcon";
import { Settings, Cpu, Globe, ArrowLeft } from "lucide-react";
import { useSettingsLogic } from "@/hooks/useSettingsLogic";
import { InterfaceSection } from "@/components/settings/InterfaceSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { CriticalActionSection } from "@/components/settings/CriticalActionSection";
import { PasswordModal } from "@/components/settings/PasswordModal";
import { DeleteModal } from "@/components/settings/DeleteModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
export default function SettingsPage() {
  const logic = useSettingsLogic();
  const t = useTranslations("Settings");
  const router = useRouter();
  return (
    <div className="min-h-screen text-white p-6 lg:pl-28 relative overflow-hidden bg-[#020106]">
      <div
        className="absolute inset-0 z-0 bg-repeat bg-center opacity-40"
        style={{ backgroundImage: "url('/Images/galaxy5.jpg')" }}
      />

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4c3ba8]/10 blur-[120px] rounded-full pointer-events-none" />

      <SidebarIcon active="settings" />

      <div className="max-w-4xl mx-auto mt-16 relative z-20">
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
            {t("back")}
          </span>
        </button>
        <header className="relative p-8 rounded-4xl border border-white/5 bg-white/2 backdrop-blur-md mb-12 overflow-hidden">
          <div className="absolute top-0 ltr:right-0 rtl:left-0 p-4 opacity-10">
            <Cpu size={120} />
          </div>

          <div className="flex items-center gap-6">
            <div className="p-6 bg-[#4c3ba8]/20 rounded-2xl border border-[#4c3ba8]/30 shadow-[0_0_20px_rgba(76,59,168,0.2)]">
              <Settings className="text-[#4c3ba8]" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                {t("title")} <span className="text-[#4c3ba8]">{t("core")}</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-gray-500 text-[10px] font-mono tracking-[0.2em] uppercase">
                  {t("desc")}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-10 pb-32">
          <section>
            <div className="flex items-center justify-between px-4 mb-6">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-indigo-400" />
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">
                  {t("env")}
                </h2>
              </div>
              <div className="h-px flex-1 bg-linear-to-r from-indigo-500/50 to-transparent ml-6" />
            </div>
            <div className="bg-white/1 border border-white/5 rounded-4xl p-2 hover:bg-white/2 transition-all">
              <InterfaceSection logic={logic} />
            </div>
          </section>

          {/* Security & Danger - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">
                {t("auth")}
              </h2>
              <div className="bg-white/1 border border-white/5 rounded-4xl p-6 h-full transition-all hover:bg-white/2">
                <SecuritySection
                  isSocial={logic.isSocialAccount}
                  onOpen={() => logic.setIsPasswordModalOpen(true)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-900/50 ml-4">
                {t("terminate")}
              </h2>
              <div className="bg-red-500/2 border border-red-500/10 rounded-4xl p-6 h-full transition-all hover:bg-red-500/4">
                <CriticalActionSection
                  onOpen={() => logic.setIsDeleteModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {logic.isPasswordModalOpen && <PasswordModal logic={logic} />}
      {logic.isDeleteModalOpen && <DeleteModal logic={logic} />}
    </div>
  );
}
