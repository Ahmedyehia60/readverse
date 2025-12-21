"use client";
import { Home, Inbox, LogOut, Search, Settings, Star } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaBook } from "react-icons/fa";
import UserButton from "./UserButton";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Favorite",
    url: "#",
    icon: Star,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();

  // Sign out handler
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/Login");
  };

  // Sidebar component
  return (
    <SidebarProvider>
      <Sidebar
        className="
          fixed inset-y-0 left-0 z-40
          w-20 md:w-64
          border-r border-white/10
          bg-[#2c215a] text-white
          flex
        "
      >
        <SidebarContent className="bg-[#2c215a] text-white flex flex-col justify-between h-full">
          {/* Menu content */}
          <div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white">
                <div className="absolute top-4 left-4 flex items-center text-white z-10 ">
                  <FaBook size={28} className="mr-2 text-black-900" />
                  <h1 className={`text-2xl font-bold`}>READVerse</h1>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-20 ">
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem
                      key={item.title}
                      className="border-b border-white/20 py-2"
                    >
                      <SidebarMenuButton asChild>
                        <a
                          href={item.url}
                          className="flex items-center gap-2 justify-between "
                        >
                          <span>{item.title}</span>
                          <item.icon />
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <UserButton />

            <Button
              onClick={handleSignOut}
              className="
      bg-red-700 hover:bg-red-800
      w-9 h-9 p-2 rounded-full
      flex items-center justify-center
    "
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
