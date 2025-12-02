/* eslint-disable @next/next/no-img-element */
"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import SidebarIcon from "@/components/SideBarIcon";
function Profile() {
  type UserType = {
    name: string;
    image: string;
  };

  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      const res = await fetch(`/api/get-user?userId=${session.user.id}`);
      const data = await res.json();
      setUser(data.user);
    };

    fetchUser();
  }, [session]);

  if (status === "loading" || !user) {
    return (
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Loading worlds..."
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <SidebarIcon active="user" />
      <div className="flex justify-between items-center p-4">
        <p className="">Profile </p>
        <Pencil size={24} />
      </div>

      <div className="flex flex-col items-center mt-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="ripple  absolute w-44 h-44 rounded-full border"></div>
          <div className="ripple  absolute w-52 h-52 rounded-full border"></div>
          <div className="ripple  absolute w-60 h-60 rounded-full border"></div>

          <img
            src={user.image || "/default-avatar.png"}
            alt="User Avatar"
            className="w-32 h-32 rounded-full object-cover relative z-10"
          />
        </div>

        <h2 className="text-2xl font-semibold  mt-9 capitalize ">
          {user.name}
        </h2>
      </div>
    </div>
  );
}

export default Profile;
