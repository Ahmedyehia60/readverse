import UserButton from "@/components/UserButton";
import { getServerSession } from "next-auth";

import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
// app/page.tsx
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/Login");
  }
  return (
    <main>
      <NextAuthProvider>
        <UserButton />
      </NextAuthProvider>
    </main>
  );
}
