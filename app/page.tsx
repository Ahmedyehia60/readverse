import UserButton from "@/components/UserButton";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/Login");
  }
  return (
    <main>
      <UserButton />
    </main>
  );
}
