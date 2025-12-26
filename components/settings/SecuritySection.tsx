import { Lock, ShieldCheck, ChevronRight, Info } from "lucide-react";

export const SecuritySection = ({
  isSocial,
  onOpen,
}: {
  isSocial: boolean;
  onOpen: () => void;
}) => (
  <section className="bg-[#120d2b]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:border-emerald-500/10">
    <h2 className="text-[11px] font-extrabold text-emerald-500/80 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
      <Lock size={14} className="text-emerald-500" /> Security Clearance
    </h2>
    <button
      disabled={isSocial}
      onClick={onOpen}
      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group border cursor-pointer ${
        isSocial
          ? "opacity-40 cursor-not-allowed border-white/5 bg-white/5"
          : "border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 shadow-lg"
      }`}
    >
      <div className="flex items-center gap-5 ">
        <div
          className={`p-3 rounded-xl transition-all ${
            isSocial
              ? "bg-gray-500/10 text-gray-500"
              : "bg-emerald-500/20 text-emerald-400 group-hover:scale-110"
          }`}
        >
          <ShieldCheck size={20} />
        </div>
        <div className="text-left ">
          <p
            className={`text-[15px] font-bold tracking-tight ${
              isSocial ? "text-gray-500" : "text-emerald-50"
            }`}
          >
            {isSocial ? "Managed by Provider" : "Update Access Keys"}
          </p>
          <p className="text-[11px] text-emerald-500/50 mt-1 uppercase tracking-wider font-black">
            {isSocial ? "Account synced with Google/FB" : "Change Password"}
          </p>
        </div>
      </div>
      {!isSocial && (
        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
          <ChevronRight size={18} />
        </div>
      )}
    </button>
    {isSocial && (
      <p className="text-[9px] text-gray-500 mt-4 font-bold uppercase tracking-widest flex items-center gap-2 px-2">
        <Info size={12} /> Security protocols are managed by external provider.
      </p>
    )}
  </section>
);
