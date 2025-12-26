/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Pencil,
  X,
  Trophy,
  Rocket,
  BookOpen,
  Target,
  Sparkles,
  Crown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import SidebarIcon from "@/components/SideBarIcon";
import { ICategory } from "@/models/users";
import { useNotifications } from "@/context/NotficationContext";

function Profile() {
  type UserType = { name: string; image: string };
  type TopCategoryType = { title: string; count: number };

  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const [numOfBooks, setNumOfBooks] = useState(0);
  const [numOfCategories, setNumOfCategories] = useState(0);
  const [topCategory, setTopCategory] = useState<TopCategoryType>({
    title: "N/A",
    count: 0,
  });

  const getRank = (count: number) => {
    if (count < 2)
      return {
        name: "Novice",
        color: "text-slate-400",
        next: 2,
        label: "Space Cadet",
      };
    if (count < 5)
      return {
        name: "Voyager",
        color: "text-blue-400",
        next: 5,
        label: "Pathfinder",
      };
    if (count < 9)
      return {
        name: "Explorer",
        color: "text-cyan-400",
        next: 9,
        label: "Star Tracker",
      };
    if (count < 14)
      return {
        name: "Pilot",
        color: "text-teal-400",
        next: 14,
        label: "Flight Lead",
      };
    if (count < 20)
      return {
        name: "Commander",
        color: "text-indigo-400",
        next: 20,
        label: "Fleet Officer",
      };
    if (count < 28)
      return {
        name: "Captain",
        color: "text-purple-400",
        next: 28,
        label: "Galaxy Guard",
      };
    if (count < 38)
      return {
        name: "Veteran",
        color: "text-pink-400",
        next: 38,
        label: "Cosmic Knight",
      };
    if (count < 50)
      return {
        name: "Legend",
        color: "text-orange-400",
        next: 50,
        label: "Star Master",
      };
    if (count < 65)
      return {
        name: "Mythic",
        color: "text-red-400",
        next: 65,
        label: "Universe Sage",
      };
    return {
      name: "Galactic Overlord",
      color: "text-yellow-400",
      next: null,
      label: "The Chosen One",
    };
  };

  const rank = getRank(numOfBooks);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!session?.user?.id) return;
      const res = await fetch("/api/books");
      const data = await res.json();

      const totalBooks =
        data.mindMap?.reduce(
          (sum: number, cat: ICategory) => sum + (cat.count || 0),
          0
        ) ?? 0;
      const totalCategories = data.mindMap?.length ?? 0;

      let maxCatName = "No Data";
      let maxCatCount = 0;
      if (data.mindMap && data.mindMap.length > 0) {
        const topCat = data.mindMap.reduce(
          (prev: ICategory, current: ICategory) =>
            (prev.count || 0) > (current.count || 0) ? prev : current
        );
        maxCatName = topCat.title || topCat.name || "Unknown";
        maxCatCount = topCat.count || 0;
      }

      setNumOfCategories(totalCategories);
      setNumOfBooks(totalBooks);
      setTopCategory({ title: maxCatName, count: maxCatCount });

      if (totalBooks > 0) {
        const currentRank = getRank(totalBooks);
        const lastNotifiedRank = localStorage.getItem("last_notified_rank");

        if (lastNotifiedRank !== currentRank.name) {
          addNotification({
            type: "achievement",
            title: "PROMOTION DETECTED",
            message: `Commander ${user?.name}, your orbital status has been upgraded to [${currentRank.name}]. Keep analyzing the cosmos!`,
            categories: [currentRank.name, currentRank.label],
          });
          localStorage.setItem("last_notified_rank", currentRank.name);
        }
      }
      // ------------------------------------
    };
    fetchBooks();
  }, [addNotification, session, user?.name]); 

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchUser = async () => {
      const res = await fetch(`/api/get-user?userId=${session.user.id}`);
      const data = await res.json();
      setUser(data.user);
      setNewName(data.user.name);
    };
    fetchUser();
  }, [session]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("userId", session?.user?.id as string);
    formData.append("name", newName);
    if (newImage) formData.append("image", newImage);

    const res = await fetch("/api/update-user", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setEdit(false);
      setUploadPreview(null);
    }
  };

  if (status === "loading" || !user)
    return (
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Initializing HUD..."
      />
    );

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative overflow-x-hidden"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <SidebarIcon active="user" />

      {/* Top Bar */}
      <div className="flex justify-between items-center p-4">
        <p className="text-xl tracking-[0.3em] font-black text-white-300/80">
          COMMANDER INTERFACE
        </p>
        <button
          onClick={() => setEdit(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold hover:bg-white/10 hover:border-white/30 transition-all"
        >
          <Pencil size={14} />
          <span>MODIFY PROFILE</span>
        </button>
      </div>

      <div className="flex flex-col items-center mt-6 px-4">
        {/* User Avatar with Original Ripple Effect */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="ripple absolute w-44 h-44 rounded-full border border-white/10 animate-ping"></div>
          <div className="ripple absolute w-52 h-52 rounded-full border border-white/5"></div>
          <div className="ripple absolute w-60 h-60 rounded-full border border-white/5"></div>

          <img
            src={uploadPreview || user.image || "/default-avatar.png"}
            alt="User Avatar"
            className="w-32 h-32 rounded-full object-cover relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-white/10"
          />
        </div>

        {/* Name & Badge */}
        <div className="text-center mt-6">
          <h2 className="text-3xl font-black capitalize tracking-tight drop-shadow-md">
            {user.name}
          </h2>
          <div
            className={`inline-flex items-center gap-2 mt-3 px-4 py-1 rounded-full bg-black/40 border border-white/10 ${rank.color} shadow-lg shadow-black/20`}
          >
            <Rocket size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {rank.name} • {rank.label}
            </span>
          </div>
        </div>

        {/* MISSION CONTROL SECTION */}
        <div className="w-full max-w-2xl mt-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
          {/* Background Icon Decoration */}
          <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={120} />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Target className="text-indigo-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest text-white/90">
                Mission Progress
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Awaiting higher orbital status
              </p>
            </div>
          </div>

          {rank.next ? (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                    Next Milestone
                  </p>
                  <p className="text-lg font-bold text-white">
                    {getRank(rank.next).name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                    Data Sync
                  </p>
                  <p className="text-lg font-black text-indigo-400">
                    {numOfBooks} / {rank.next}{" "}
                    <span className="text-xs text-gray-500">BOOKS</span>
                  </p>
                </div>
              </div>

              {/* Progress Bar Design */}
              <div className="relative">
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div
                    className="h-full bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(129,140,248,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${(numOfBooks / rank.next) * 100}%` }}
                  ></div>
                </div>
                {/* Progress Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-linear-to-r from-transparent via-white/5 to-transparent"></div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <Sparkles size={12} className="text-yellow-500 animate-pulse" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em]">
                  Analyze {rank.next - numOfBooks} more books to achieve{" "}
                  {getRank(rank.next).label} status
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
                Universal Peak: Galactic Overlord
              </p>
              <p className="text-[10px] text-yellow-200/60 mt-2 uppercase">
                You have reached the ultimate cosmic knowledge
              </p>
            </div>
          )}
        </div>

        {/* Planet Stats Grid (3 Planets) */}
        <div className="mt-12 mb-24 flex flex-row items-center justify-center flex-wrap gap-12 w-full">
          {/* 1. Total Books Planet */}
          <div className="relative flex items-center justify-center group">
            <div className="absolute w-48 h-48 rounded-full border border-purple-400/10 animate-[orbit_20s_linear_infinite]"></div>
            <div className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center bg-linear-to-br from-indigo-500/10 via-purple-600/20 to-black/40 border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.2)] backdrop-blur-md group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] transition-all duration-500">
              <BookOpen className="text-purple-300 mb-1 opacity-70" size={20} />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Knowledge
              </p>
              <p className="text-2xl font-black text-white">{numOfBooks}</p>
            </div>
          </div>

          {/* 2. Top Category Center Hub */}
          <div className="relative z-10 w-full max-w-[300px] h-40 rounded-3xl flex flex-col items-center justify-center text-center bg-black/60 border border-white/5 shadow-2xl backdrop-blur-2xl group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Trophy
              className="text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              size={28}
            />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              Dominant Sector
            </p>
            <p className="text-xl font-black text-white mt-1 line-clamp-1 px-6 uppercase tracking-tight">
              {topCategory.title}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-8 h-px bg-cyan-500/30"></span>
              <p className="text-[9px] font-bold text-cyan-300 uppercase">
                {topCategory.count} Active Objects
              </p>
              <span className="w-8 h-px bg-cyan-500/30"></span>
            </div>
          </div>

          {/* 3. Categories Planet */}
          <div className="relative flex items-center justify-center group">
            <div className="absolute w-48 h-48 rounded-full border border-cyan-400/10 animate-[orbit_25s_linear_infinite] direction-reverse"></div>
            <div className="relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center text-center bg-linear-to-tr from-cyan-500/10 via-blue-600/20 to-black/40 border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-md group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(34,211,238,0.4)] transition-all duration-500">
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
                Sectors
              </p>
              <p className="text-2xl font-black text-white">
                {numOfCategories}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (Keeping Your Original Layout) */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#120d2b] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <button
              className="absolute right-6 top-6 rounded-full p-2 hover:bg-white/5 transition"
              onClick={() => {
                setEdit(false);
                setUploadPreview(null);
                setNewImage(null);
                setNewName(user.name);
              }}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
              <p className="text-sm text-gray-400 mt-1">
                Update your commander credentials.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <img
                  src={uploadPreview || user.image || "/default-avatar.png"}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500/50 shadow-xl"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Pencil size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Commander Name
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Avatar Uplink
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:font-bold hover:file:bg-indigo-500 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewImage(file);
                    if (file) setUploadPreview(URL.createObjectURL(file));
                  }}
                />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-4">
              <button
                onClick={() => setEdit(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-black text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
