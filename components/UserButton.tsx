"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "@/i18n/routing";
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
  const [user, setUser] = useState<UserType | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        setUser(data.user ? { name: data.user.name, image: "" } : null);
      } finally {
        setStatus("ready");
      }
    };

    fetchUser();
  }, []);

  if (status === "loading") {
    return <Loader className="size-5 animate-spin" />;
  }
  if (!user) return null;

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
