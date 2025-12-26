import { AlertCircle } from "lucide-react";

interface CriticalActionProps {
  onOpen: () => void;
}

export const CriticalActionSection = ({ onOpen }: CriticalActionProps) => (
  <section className="bg-red-800/25 border border-red-500/10 rounded-[2.5rem] p-8 mt-10 shadow-lg group hover:border-red-500/30 transition-all duration-500">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="text-center sm:text-left">
        <h2 className="text-[11px] font-extrabold text-red-500 uppercase tracking-[0.3em] mb-2 flex items-center justify-center sm:justify-start gap-2">
          <AlertCircle size={14} className="animate-pulse" /> Critical Action
        </h2>
        <p className="text-[15px] font-bold text-red-100 tracking-tight">
          Initiate Self-Destruct
        </p>
        <p className="text-[11px] text-red-500/60 uppercase mt-1 tracking-wider font-bold">
          Collapses your entire universe and erases all data
        </p>
      </div>

      <button
        onClick={onOpen}
        className="w-full sm:w-auto px-10 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 rounded-2xl text-[11px] font-extrabold tracking-widest transition-all uppercase shadow-lg active:scale-95 hover:shadow-red-900/20 cursor-pointer"
      >
        Terminate Galaxy
      </button>
    </div>
  </section>
);
