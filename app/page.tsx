"use client";
import UserButton from "@/components/UserButton";
import { SessionProvider } from "next-auth/react";

// app/page.tsx
export default function Home() {
  return (
    <main>
      <SessionProvider>
        <UserButton />
      </SessionProvider>
    </main>
  );
}
