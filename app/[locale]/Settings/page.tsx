"use client";

import SidebarIcon from "@/components/SideBarIcon";
import { Settings } from "lucide-react";
import { useSettingsLogic } from "@/hooks/useSettingsLogic";
import { InterfaceSection } from "@/components/settings/InterfaceSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { CriticalActionSection } from "@/components/settings/CriticalActionSection";
import { PasswordModal } from "@/components/settings/PasswordModal";
import { DeleteModal } from "@/components/settings/DeleteModal";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const logic = useSettingsLogic();
  const t = useTranslations("Settings");
  return (
    <div
      className={`min-h-screen transition-colors duration-700  text-white p-6 lg:pl-24 relative overflow-x-hidden  bg-center bg-repeat  `}
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <SidebarIcon active="settings" />

      <div className="max-w-3xl mx-auto mt-12 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-5 mb-12">
          <Settings
            className={logic.isDeepSpace ? "text-indigo-400" : "text-pink-400"}
            size={32}
          />
          <h1 className="text-4xl font-extrabold uppercase">{t("title")}</h1>
        </div>

        <div className="space-y-6 pb-20">
          <InterfaceSection logic={logic} />
          <SecuritySection
            isSocial={logic.isSocialAccount}
            onOpen={() => logic.setIsPasswordModalOpen(true)}
          />
          <CriticalActionSection
            onOpen={() => logic.setIsDeleteModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      {logic.isPasswordModalOpen && <PasswordModal logic={logic} />}
      {logic.isDeleteModalOpen && <DeleteModal logic={logic} />}
    </div>
  );
}
