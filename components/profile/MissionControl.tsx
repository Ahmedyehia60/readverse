import React from "react";
import { Target, Sparkles, Crown } from "lucide-react";
import { RankType } from "@/constants/ranks";
import { getRank } from "@/constants/ranks";

interface IMissionProps {
  rank: RankType;
  numOfBooks: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const MissionControl: React.FC<IMissionProps> = ({ rank, numOfBooks, t }) => {
  return (
    <div className="w-full max-w-2xl mt-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
      <div className="absolute -top-4 ltr:-right-4 rtl:-left-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target size={120} />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
          <Target className="text-indigo-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-widest text-white/90 text-start">
            {t("missionControl.title")}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest text-start">
            {t("missionControl.status")}
          </p>
        </div>
      </div>

      {rank.next ? (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                {t("missionControl.nextMilestone")}
              </p>
              <p className="text-lg font-bold text-white">
                {t(getRank(rank.next).name)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                {t("missionControl.dataSync")}
              </p>
              <p className="text-lg font-black text-indigo-400 ">
                {numOfBooks} / {rank.next}
                <span className="text-xs text-gray-500 ">
                  {" "}
                  {t("missionControl.books")}
                </span>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div
                className="h-full bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(129,140,248,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${(numOfBooks / rank.next) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Sparkles size={12} className="text-yellow-500 animate-pulse" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em]">
              {t("missionControl.remaining", {
                count: rank.next - numOfBooks,
                label: t(`ranks.labels.${getRank(rank.next).label}`),
              })}
            </p>
            <Sparkles size={12} className="text-yellow-500 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-yellow-500/20 rounded-2xl bg-yellow-500/5">
          <Crown
            className="mx-auto text-yellow-400 mb-2 animate-bounce"
            size={32}
          />
          <p className="text-yellow-400 font-black tracking-[0.3em] uppercase">
            {t("missionControl.peakTitle")}
          </p>
        </div>
      )}
    </div>
  );
};

export default MissionControl;
