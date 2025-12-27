import { SettingsLogicType } from "@/hooks/useSettingsLogic";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export const InterfaceSection = ({ logic }: { logic: SettingsLogicType }) => {
  const t = useTranslations("Settings");
  const pathname = usePathname(); // بيجيب المسار الحالي زي /en/settings
  const router = useRouter(); // عشان نغير المسار

  const handleLanguageChange = (newLocale: string) => {
    // 1. بنحدد اللغة الجديدة (ar أو en)
    const locale = newLocale.toLowerCase();

    // 2. بنغير المسار الحالي باللغة الجديدة
    // بنشيل أول جزء من المسار (اللغة القديمة) ونحط الجديدة
    const newPath = pathname.replace(/^\/(en|ar)/, `/${locale}`);

    // 3. بنوجه المستخدم للمسار الجديد
    router.push(newPath);

    // 4. (اختياري) تحديث الـ Logic المحلي لو محتاجة
    logic.setLanguage(newLocale);
  };
  return (
    <section className="bg-[#120d2b]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-white/10">
      <h2 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
        <Sparkles size={14} /> {t("sections.interface")}
      </h2>
      <div className="space-y-10">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between group">
          <div>
            <p className="text-[15px] font-bold tracking-tight">
              {t("labels.galaxyEnv")}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
              {t("labels.theme")}:
              {logic.isDeepSpace ? t("labels.deepSpace") : t("labels.nebula")}
            </p>
          </div>
          <button
            onClick={() => logic.setIsDeepSpace(!logic.isDeepSpace)}
            className={`w-20 h-10 rounded-full p-1 transition-all duration-500 flex items-center border shadow-inner ${
              logic.isDeepSpace
                ? "bg-indigo-900/40 border-indigo-500/30"
                : "bg-pink-900/40 border-pink-500/30"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform shadow-lg ${
                logic.isDeepSpace
                  ? "translate-x-0 bg-indigo-500"
                  : "translate-x-10 bg-pink-500"
              }`}
            >
              {logic.isDeepSpace ? <Moon size={16} /> : <Sun size={16} />}
            </div>
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div>
            <p className="text-[15px] font-bold tracking-tight text-white/90">
              {t("labels.uplinkLanguage")}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
              {t("labels.protocol")}:
              {pathname.startsWith("/en") ? " English" : " العربية"}
            </p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 relative w-24 h-10 overflow-hidden shadow-inner">
            <div
              className={`absolute top-1 bottom-1 w-[46px] transition-all duration-300 rounded-xl border border-white/5 shadow-lg ${
                pathname.startsWith("/en")
                  ? "left-1 bg-gray-500/40"
                  : "left-[47px] bg-gray-600/50"
              }`}
            />

            <button
              onClick={() => handleLanguageChange("en")}
              className={`relative z-10 flex-1 text-[10px] font-black transition-colors ${
                pathname.startsWith("/en") ? "text-white" : "text-gray-500"
              }`}
            >
              EN
            </button>

            <button
              onClick={() => handleLanguageChange("ar")}
              className={`relative z-10 flex-1 text-[10px] font-black transition-colors ${
                pathname.startsWith("/ar") ? "text-white" : "text-gray-500"
              }`}
            >
              AR
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
