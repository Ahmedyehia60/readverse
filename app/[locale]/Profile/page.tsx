"use client";
import React, { useEffect, useState, useMemo } from "react";
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

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [numOfBooks, setNumOfBooks] = useState<number>(0);
  const [numOfCategories, setNumOfCategories] = useState<number>(0);
  const [topCategory, setTopCategory] = useState<TopCategoryType>({
    title: "",
    count: 0,
  });

  const t = useTranslations("Profile");

  const rank = useMemo(() => getRank(numOfBooks), [numOfBooks]);

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

        const totalBooks =
          booksData.mindMap?.reduce(
            (sum: number, cat: ICategory) => sum + (cat.count || 0),
            0
          ) ?? 0;
        setNumOfBooks(totalBooks);
        setNumOfCategories(booksData.mindMap?.length ?? 0);
        setUser(userData.user);

        if (booksData.mindMap && booksData.mindMap.length > 0) {
          const top = booksData.mindMap.reduce((p: ICategory, c: ICategory) =>
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
  }, [session]);

  if (status === "loading" || !user)
    return <Loader text="Initializing HUD..." />;

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
