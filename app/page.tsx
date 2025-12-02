import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashBoard from "@/components/DashBoard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/Login");
  }
  return (
    <main>
      <DashBoard />
    </main>
  );
}
