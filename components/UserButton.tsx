"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = {
  name: string;
  image: string;
};

type UserButtonProps = {
  className?: string;
};

const UserButton = ({ className }: UserButtonProps) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

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
    return <Loader className="size-5 animate-spin" />;
  }

  const avatarFallback = user.name.charAt(0).toUpperCase();

  const handelRedirectProfile = () => {
    router.push("/Profile");
  };

  return (
    <button
      type="button"
      onClick={handelRedirectProfile}
      className={cn(
        "flex items-center gap-3 px-1 py-1 cursor-pointer",
        className
      )}
    >
      <Avatar className="w-9 h-9">
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback className="bg-sky-900 text-white">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>

      <span className="capitalize whitespace-nowrap text-sm font-medium">
        {user.name}
      </span>
    </button>
  );
};

export default UserButton;
