/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Rocket } from "lucide-react";
import { UserType, RankType } from "@/constants/ranks";

interface IHeaderProps {
  user: UserType;
  rank: RankType;
  t: (key: string) => string;
}

const UserProfileHeader: React.FC<IHeaderProps> = ({ user, rank, t }) => {
  return (
    <div className="flex flex-col items-center mt-6 px-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="ripple absolute w-44 h-44 rounded-full border border-white/10 animate-ping"></div>
        <div className="ripple absolute w-52 h-52 rounded-full border border-white/5"></div>
        <div className="ripple absolute w-60 h-60 rounded-full border border-white/5"></div>

        <img
          src={user.image || "/default-avatar.png"}
          alt="User Avatar"
          className="w-32 h-32 rounded-full object-cover relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-white/10"
        />
      </div>

      <div className="text-center mt-6">
        <h2 className="text-3xl font-black capitalize tracking-tight drop-shadow-md">
          {user.name}
        </h2>
        <div
          className={`inline-flex items-center gap-2 mt-3 px-4 py-1 rounded-full bg-black/40 border border-white/10 ${rank.color} shadow-lg shadow-black/20`}
        >
          <Rocket size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {t(rank.name)} • {t(`ranks.labels.${rank.label}`)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
