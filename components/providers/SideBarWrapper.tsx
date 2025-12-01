"use client";
import SidebarIcon from "../SideBarIcon";
import { useSession } from "next-auth/react";

export default function SidebarWrapper() {
  const { status } = useSession();

  if (status === "loading") return null;

  return <SidebarIcon />;
}
