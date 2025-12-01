"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Layers, Star, User } from "lucide-react";
interface SidebarIconsProps {
  activeIcon: string;
  setActiveIcon: (value: string) => void;
}

export default function SidebarIcon({
  activeIcon,
  setActiveIcon,
}: SidebarIconsProps) {
  const router = useRouter();
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const tooltipLabels: Record<string, string> = {
    home: "Home Page",
    star: "Favorite List",
    layers: "Categories",
    user: "Profile",
  };

  const icons = [
    { id: "star", icon: Star, name: "Favorites" },
    { id: "layers", icon: Layers, name: "Categories" },
    { id: "user", icon: User, name: "Profile" },
  ];

  return (
    <div className="absolute left-5 top-1/2 -translate-y-1/2 border-3 border-[#2B1B72] py-4 px-2 rounded-lg">
      {/* Home */}
      <div className="relative flex justify-center my-3">
        <Button
          className={`p-3 rounded-full backdrop-blur-sm cursor-pointer transition ${
            activeIcon === "home"
              ? "bg-[#2B1B72] hover:bg-[#2B1B72]"
              : "bg-white/10 hover:bg-white/20"
          }`}
          onClick={() => {
            setActiveIcon("home");
            router.push("/Home");
          }}
          onMouseEnter={() => setHoveredIcon("home")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <Home className="w-3 h-3 text-white" />
        </Button>

        {hoveredIcon === "home" && (
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
            {tooltipLabels["home"]}
          </div>
        )}
      </div>

      {/* باقي الأيقونات */}
      {icons.map(({ id, icon: Icon, name }) => (
        <div key={id} className="relative flex justify-center my-3">
          <div
            onClick={() => {
              setActiveIcon(id);
              router.push(`/${name}`);
            }}
            onMouseEnter={() => setHoveredIcon(id)}
            onMouseLeave={() => setHoveredIcon(null)}
            className={`
              p-3 rounded-full backdrop-blur-sm cursor-pointer transition
              ${
                activeIcon === id
                  ? "bg-[#2B1B72]"
                  : "bg-white/10 hover:bg-white/20"
              }
            `}
          >
            <Icon className="w-3 h-3 text-white mx-auto" />
          </div>

          {hoveredIcon === id && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
              {tooltipLabels[id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
