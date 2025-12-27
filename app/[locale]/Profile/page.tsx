/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState, useMemo } from "react";

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
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";

import EditProfileModal from "@/components/profile/EditProfileModal";
import Loader from "@/components/Loader";
import SidebarIcon from "@/components/SideBarIcon";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import MissionControl from "@/components/profile/MissionControl";
import PlanetStats from "@/components/profile/PlanetStats";

import { UserType, TopCategoryType } from "@/constants/ranks";
import { ICategory } from "@/models/users";
import { getRank } from "@/constants/ranks";

import { useNotifications } from "@/context/NotficationContext";

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [numOfBooks, setNumOfBooks] = useState<number>(0);
  const [numOfCategories, setNumOfCategories] = useState<number>(0);
  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [numOfBooks, setNumOfBooks] = useState(0);
  const [numOfCategories, setNumOfCategories] = useState(0);
  const { addNotification, notifications } = useNotifications();
  const hasNotified = useRef(false);
  const [topCategory, setTopCategory] = useState<TopCategoryType>({
    title: "",
    count: 0,
  });

  const t = useTranslations("Profile");

  const rank = useMemo(() => getRank(numOfBooks), [numOfBooks]);
  //=================================================fetch books and handle rank==================================
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

  //=================================================fetch books and handle rank==================================

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        const [booksRes, userRes] = await Promise.all([
          fetch("/api/books"),
          fetch(`/api/get-user?userId=${session.user.id}`),
        ]);

        const booksData = await booksRes.json();
        const userData = await userRes.json();
        const fetchBooksAndNotify = async () => {
          if (!session?.user?.id || hasNotified.current) return;
          try {
            hasNotified.current = true;
            const res = await fetch("/api/books");
            const data = await res.json();

            const totalBooks =
              booksData.mindMap?.reduce(
                (sum: number, cat: ICategory) => sum + (cat.count || 0),
                0
              ) ?? 0;
            setNumOfBooks(totalBooks);
            setNumOfCategories(booksData.mindMap?.length ?? 0);
            setUser(userData.user);

            if (booksData.mindMap && booksData.mindMap.length > 0) {
              const top = booksData.mindMap.reduce(
                (p: ICategory, c: ICategory) =>
                  (p.count || 0) > (c.count || 0) ? p : c
              );
              setTopCategory({
                title: top.title || top.name || "Unknown",
                count: top.count || 0,
              });
            }
          } catch (error) {
            console.error("Failed to fetch profile data", error);
          }
        };

        fetchData();
        const totalBooks =
          data.mindMap?.reduce(
            (sum: number, cat: any) => sum + (cat.count || 0),
            0
          ) ?? 0;

        setNumOfCategories(data.mindMap?.length ?? 0);
        setNumOfBooks(totalBooks);

        if (data.mindMap && data.mindMap.length > 0) {
          const top = data.mindMap.reduce((prev: any, current: any) =>
            (prev.count || 0) > (current.count || 0) ? prev : current
          );
          setTopCategory({ title: top.name, count: top.count });
        }

        const currentRank = getRank(totalBooks);
        const userNotifications = data.notifications || [];
        const lastAchievement = userNotifications
          .filter((n: any) => n.type === "achievement")
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

        if (
          totalBooks > 0 &&
          (!lastAchievement ||
            lastAchievement.categories?.[0] !== currentRank.name)
        ) {
          const commanderName =
            user?.name || session?.user?.name || "Ahmed Yehia";

          await addNotification({
            type: "achievement",
            title: "PROMOTION DETECTED",
            message: `Commander ${commanderName}, your orbital status has been upgraded to [${currentRank.name}]. Keep analyzing the cosmos!`,
            categories: [currentRank.name, currentRank.label],
          });
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
        hasNotified.current = false;
      }
    };
    fetchBooksAndNotify();
    return () => {
      hasNotified.current = false;
    };
  }, [session?.user?.id, addNotification, user?.name, session?.user?.name]);

  //=================================================fetch top category==================================
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

  //=================================================determine top category==================================

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
        text="Loading worlds..."
      />
    );

  //=================================================MAIN RETURN JSX==================================
  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative overflow-x-hidden"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <SidebarIcon active="user" />

      <div className="flex justify-between items-center p-4">
        <p className="text-xl tracking-[0.3em] font-black text-white-300/80">
          {t("interfaceTitle")}
        </p>
        <button
          onClick={() => setEdit(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold hover:bg-white/10 transition-all"
        >
          <Pencil size={14} /> <span>{t("modifyBtn")}</span>
        </button>
      </div>

      <UserProfileHeader user={user} rank={rank} t={t} />

      <div className="flex flex-col items-center">
        <MissionControl rank={rank} numOfBooks={numOfBooks} t={t} />
        <PlanetStats
          numOfBooks={numOfBooks}
          numOfCategories={numOfCategories}
          topCategory={topCategory}
          t={t}
        />
      </div>

      {edit && (
        <EditProfileModal
          user={{ ...user, id: session?.user?.id as string }}
          onClose={() => setEdit(false)}
          onUpdate={(updatedUser) => setUser(updatedUser as UserType)}
        />
      )}
    </div>
  );
};

export default Profile;
