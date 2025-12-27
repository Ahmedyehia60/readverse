import React from "react";
import { BookOpen, Trophy } from "lucide-react";
import { TopCategoryType } from "@/constants/ranks";

interface IPlanetProps {
  numOfBooks: number;
  numOfCategories: number;
  topCategory: TopCategoryType;
  t: (key: string) => string;
}

const PlanetStats: React.FC<IPlanetProps> = ({
  numOfBooks,
  numOfCategories,
  topCategory,
  t,
}) => {
  return (
    <div className="mt-12 mb-24 flex flex-row items-center justify-center flex-wrap gap-12 w-full">
      <div className="relative flex items-center justify-center group">
        <div className="absolute w-48 h-48 rounded-full border border-purple-400/10 animate-[orbit_20s_linear_infinite]"></div>
        <div className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center bg-linear-to-br from-indigo-500/10 via-purple-600/20 to-black/40 border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.2)] backdrop-blur-md group-hover:scale-110 transition-all duration-500">
          <BookOpen className="text-purple-300 mb-1 opacity-70" size={20} />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t("stats.knowledge")}
          </p>
          <p className="text-2xl font-black text-white">{numOfBooks}</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[300px] h-40 rounded-3xl flex flex-col items-center justify-center text-center bg-black/60 border border-white/5 shadow-2xl backdrop-blur-2xl group overflow-hidden">
        <Trophy
          className="text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          size={28}
        />
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          {t("stats.dominantSector")}
        </p>
        <p className="text-xl font-black text-white mt-1 line-clamp-1 px-6 uppercase tracking-tight">
          {topCategory.title}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="w-8 h-px bg-cyan-500/30"></span>
          <p className="text-[9px] font-bold text-cyan-300 uppercase">
            {topCategory.count} {t("stats.activeObjects")}
          </p>
          <span className="w-8 h-px bg-cyan-500/30"></span>
        </div>
      </div>

      <div className="relative flex items-center justify-center group">
        <div className="absolute w-48 h-48 rounded-full border border-cyan-400/10 animate-[orbit_25s_linear_infinite] direction-reverse"></div>
        <div className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center bg-linear-to-tr from-cyan-500/10 via-blue-600/20 to-black/40 border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-md group-hover:scale-110 transition-all duration-500">
          <div className="text-cyan-300 mb-1 opacity-70">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t("stats.sectors")}
          </p>
          <p className="text-2xl font-black text-white">{numOfCategories}</p>
        </div>
      </div>
    </div>
  );
};

export default PlanetStats;
