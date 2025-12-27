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
import { INotification } from "@/models/users";
import { useNotifications } from "@/context/NotficationContext";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function AppSidebar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(
    (n: INotification) => !n.isRead
  ).length;
  const router = useRouter();
  const t = useTranslations("Sidebar");

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/Login");
  };

  const items = [
    { title: t("home"), url: "/", icon: Home },
    { title: t("inbox"), url: "/Inbox", icon: Inbox },
    { title: t("favorite"), url: "/Favorites", icon: Star },
    { title: t("search"), url: "#", icon: Search },
    { title: t("settings"), url: "/Settings", icon: Settings },
  ];

  const addBtnColor = "#4c3ba8";

  return (
    <SidebarProvider>
      <Sidebar className="border-inline-end border-white/10 isolate z-100">
        <SidebarContent className="bg-[#020106] text-white flex flex-col justify-between h-full shadow-[20px_0_50px_rgba(0,0,0,0.8)]">
          <div>
            <SidebarGroup>
              <SidebarGroupLabel
                className="h-20 flex items-center px-4 dir-ltr"
                style={{ direction: "ltr" }}
              >
                <div
                  className="flex items-center gap-3 dir-ltr"
                  style={{ direction: "ltr" }}
                >
                  <FaBook
                    size={24}
                    style={{ color: addBtnColor }}
                    className="drop-shadow-[0_0_10px_rgba(76,59,168,0.8)]"
                  />
                  <h1 className="text-xl font-black tracking-tighter italic uppercase bg-clip-text text-transparent bg-linear-to-r from-white to-[#4c3ba8]">
                    READVerse
                  </h1>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2 pt-4">
                <SidebarMenu className="gap-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-white/5 transition-all duration-300 rounded-xl h-12 group/item"
                      >
                        <Link
                          href={item.url}
                          className="flex items-center w-full px-3 gap-3"
                          onClick={
                            item.title === t("search")
                              ? (e) => {
                                  e.preventDefault();
                                  onSearchClick?.();
                                }
                              : undefined
                          }
                        >
                          <div className="relative shrink-0">
                            <item.icon className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover/item:text-[#4c3ba8] group-hover/item:drop-shadow-[0_0_8px_#4c3ba8]" />

                            {item.url === "/Inbox" && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rtl:-left-1 rtl:right-auto">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4c3ba8] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4c3ba8]"></span>
                              </span>
                            )}
                          </div>

                          <span className="flex-1 font-medium text-gray-300 group-hover/item:text-white transition-colors text-start text-sm">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="p-4 border-t border-white/5 bg-[#020106]">
            <div
              className="flex items-center justify-between gap-4"
              style={{ direction: "ltr" }}
            >
              <div className="flex-1 overflow-hidden">
                <UserButton />
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-10 h-10 p-0 rounded-xl transition-all duration-300 shrink-0"
              >
                <LogOut size={18} className="rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
