// app/(main)/layout.tsx
import SideBarIcon from "@/components/SideBarIcon";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">


      <SideBarIcon />
      {children}
    </div>
  );
}
