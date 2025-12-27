import { SettingsLogicType } from "@/hooks/useSettingsLogic";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl"; // استدعاء الترجمة

export const PasswordModal = ({ logic }: { logic: SettingsLogicType }) => {
  const t = useTranslations("PasswordModal"); // استخدام قاموس المودال

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#0b081a] border border-emerald-500/30 p-10 rounded-[3rem] max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        {/* العناوين المترجمة مع دعم المحاذاة */}
        <h2 className="text-2xl font-black text-white uppercase mb-2 text-start">
          {t("title")}
        </h2>
        <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-8 text-start">
          {t("description")}
        </p>

        {logic.passwordStatus.text && (
          <div
            className={`mb-6 p-4 rounded-2xl text-[10px] font-bold uppercase border text-start ${
              logic.passwordStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {logic.passwordStatus.text}
          </div>
        )}

        <form onSubmit={logic.handleUpdatePassword} className="space-y-4">
          {(["current", "new", "confirm"] as const).map((field) => (
            <input
              key={field}
              type="password"
              placeholder={t(`fields.${field}`).toUpperCase()}
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-emerald-500/50 outline-none transition-all text-start"
              value={logic.passwords[field]}
              onChange={(e) =>
                logic.setPasswords({
                  ...logic.passwords,
                  [field]: e.target.value,
                })
              }
            />
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => logic.setIsPasswordModalOpen(false)}
              className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 cursor-pointer"
            >
              {t("buttons.abort")}
            </button>
            <button
              type="submit"
              disabled={logic.loading}
              className="flex-2 py-4 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-500 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {logic.loading ? (
                <Loader2 className="animate-spin mx-auto" size={18} />
              ) : (
                t("buttons.authorize")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
