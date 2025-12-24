import { ChevronsLeft, ChevronsRight } from "lucide-react";
import SidebarIcon from "../SideBarIcon";
import { AppSidebar } from "../SideBar";
import { useState } from "react";

interface SidebarWrapperProps {
  onSearchClick: () => void;
}

export const SidebarWrapper = ({ onSearchClick }: SidebarWrapperProps) => {
  const [showBar, setShowBar] = useState(false);

  return (
    <>
      {showBar ? (
        <div className="hidden md:block">
          <AppSidebar onSearchClick={onSearchClick} />
          <ChevronsLeft
            className="top-1/2 -translate-y-1/2 left-[260px] cursor-pointer z-50 fixed text-white bg-[#2B1B72] rounded-full p-1"
            onClick={() => setShowBar(false)}
          />
        </div>
      ) : (
        <div className="hidden md:block">
          <ChevronsRight
            className="absolute top-1/2 -translate-y-1/2 left-25 cursor-pointer z-0 text-white bg-[#2B1B72] rounded-full p-1"
            onClick={() => setShowBar(true)}
          />
          <SidebarIcon active="home" />
        </div>
      )}
    </>
  );
};
