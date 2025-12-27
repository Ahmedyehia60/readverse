import { SettingsLogicType } from "@/hooks/useSettingsLogic";
import { useTranslations } from "next-intl";

export const DeleteModal = ({ logic }: { logic: SettingsLogicType }) => {
  const t = useTranslations("deleteModal");
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#0b081a] border border-red-500/30 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 relative">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <span className="text-4xl font-black text-red-500 relative z-10">
            {logic.countdown}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-white uppercase mb-3">
          {t("title")}
        </h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase mb-10 whitespace-pre-line">
          {t("description", { count: logic.countdown })}
        </p>
        <button
          onClick={logic.cancelDelete}
          className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] text-white cursor-pointer transition-all"
        >
          {t("abort")}
        </button>
      </div>
    </div>
  );
};
