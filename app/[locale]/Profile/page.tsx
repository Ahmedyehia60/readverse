"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { getRank } from "@/constants/ranks";
import { useNotifications } from "@/context/NotficationContext";
import { ICategory, INotification } from "@/models/users";

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

  const { addNotification, notifications } = useNotifications();
  const t = useTranslations("Profile");
  const s = useTranslations("Notifications.achievement");
  const hasNotified = useRef(false);
  const rank = useMemo(() => getRank(numOfBooks), [numOfBooks]);


  
  useEffect(() => {
    const fetchBooksAndNotify = async () => {
      if (!session?.user?.id || hasNotified.current) return;
      try {
        hasNotified.current = true;
        const res = await fetch("/api/books");
        const data = await res.json();

        const totalBooks =
          data.mindMap?.reduce(
            (sum: number, cat: ICategory) => sum + (cat.count || 0),
            0
          ) ?? 0;

        setNumOfCategories(data.mindMap?.length ?? 0);
        setNumOfBooks(totalBooks);

        if (data.mindMap && data.mindMap.length > 0) {
          const top = data.mindMap.reduce(
            (prev: ICategory, current: ICategory) =>
              (prev.count || 0) > (current.count || 0) ? prev : current
          );
          setTopCategory({ title: top.name, count: top.count });
        }

        const currentRank = getRank(totalBooks);
        const userNotifications = data.notifications || [];
        const lastAchievement = userNotifications
          .filter((n: INotification) => n.type === "achievement")
          .sort(
            (a: INotification, b: INotification) =>
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
            title: s("promotionTitle"),
            message: s("promotionMessage", {
              name: commanderName,
              rank: currentRank.name,
            }),
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


  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/get-user?userId=${session.user.id}`);
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("User fetch failed", error);
      }
    };

    fetchUserData();
  }, [session?.user?.id]);
  if (status === "loading" || !user)
    return (
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Loading worlds..."
      />
    );

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
