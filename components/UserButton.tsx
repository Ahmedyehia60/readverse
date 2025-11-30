"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { Loader } from "lucide-react";

type UserType = {
  name: string;
  image: string;
};

const UserButton = () => {
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
    return <Loader className="size-6 mr-4 mt-4 float-right animate-spin" />;
  }

  const avatarFallback = user.name.charAt(0).toUpperCase();

  return (
    <nav>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none relative float-right p-4 md:p-8">
          <div className="flex gap-4 items-center">
            <span>{user.name}</span>
            <Avatar className="size-10 hover:opacity-75 transition">
              <AvatarImage
                className="size-10 hover:opacity-75 transition"
                src={user.image || undefined}
              />
              <AvatarFallback className="bg-sky-900 text-white">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </nav>
  );
};

export default UserButton;
