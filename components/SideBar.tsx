"use client";
import { Calendar, Home, Inbox, LogOut, Search, Settings } from "lucide-react";

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
    title: "Calendar",
    url: "#",
    icon: Calendar,
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
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/Login");
  };
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="bg-[#251d4a] text-white flex flex-col justify-between h-full">
          {/* Menu content */}
          <div>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white">
                Application
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="p-4 flex justify-end">
            <Button
              className="rounded-full w-10 h-10 flex items-center justify-center bg-[#4c0909] hover:bg-[#700404] cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut />
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
