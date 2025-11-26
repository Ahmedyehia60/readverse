"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaBook, FaFacebook } from "react-icons/fa";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";

//======================================================

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

function Page() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error");
  //================== Handle Submit =======================

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    // Simulate form submission
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (signInRes?.ok) {
        setPending(false);
        router.push("/");
        router.refresh();
      }
      router.push("/");
    } else if (res.status === 400) {
      setError(data.message);
      setPending(false);
    } else if (res.status === 500) {
      setError(data.message);
      console.error("Server Error:", data.message);
      setPending(false);
    }
  };

  //===============================handelprovider=========================
  const handleProvider = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: "google-signup" | "apple" | "facebook-signup"
  ) => {
    event.preventDefault();
    signIn(value, { callbackUrl: "/" });
  };

  useEffect(() => {
    if (errorType === "AlreadyExists") {
      toast.error(
        "An account with this Google email already exists. Please log in instead."
      );
    }
  }, [errorType]);

  //================== JSX ==============================================
  return (
    <div className="min-h-screen flex   relative bg-[#0b0b0b]">
      <div className="absolute top-4 left-4 flex items-center text-white z-10">
        <FaBook size={28} className="mr-2 text-blue-900" />
        <h1 className="text-2xl font-bold">READVerse</h1>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col">
        <Card className="w-full min-h-screen overflow-y-auto max-w-none rounded-none bg-[#0b0b0b] border-0  flex flex-col justify-center p-8 sm:p-12  scale-90">
          <CardHeader className="space-y-2 px-0">
            <CardTitle
              className={`text-center text-white text-3xl font-bold ${spaceGrotesk.className}`}
            >
              Create Your Book Galaxy
            </CardTitle>
            <CardDescription
              className={`text-center text-gray-300 text-sm  ${spaceGrotesk.className}`}
            >
              Map your literary journey across the stars.
            </CardDescription>
          </CardHeader>

          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlert />
              <p>{error}</p>
            </div>
          )}

          <CardContent className="px-0 max-w-[450px] mx-auto w-full">
            <form className="flex flex-col gap-5" onSubmit={handelSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-300">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  disabled={pending}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="
                  w-full h-12
                  px-4 rounded-md
                  bg-white/10 border border-white/20
                  text-white placeholder:text-gray-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-900
                "
                />
              </div>

              {/*================== Email===================== */}

              <div className="flex flex-col gap-1.5">
                <label
                  className={`${spaceGrotesk.className} text-sm text-gray-300`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  disabled={pending}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-12 px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/*================== Password====================== */}
              <div className="flex flex-col gap-1.5">
                <label
                  className={`text-sm text-gray-300 ${spaceGrotesk.className}`}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  disabled={pending}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="h-12 px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <Button
                disabled={pending}
                className={` ${spaceGrotesk.className} w-full h-12 bg-[#2B1B72] hover:bg-[#3d257f] text-white text-lg`}
              >
                Sign Up
              </Button>
            </form>

            <Separator className="my-6 bg-white/20" />

            <div className="flex items-center gap-4 my-6">
              <Separator className="bg-white/20 flex-1 h-px" />
              <p className="text-white text-sm">Or</p>
              <Separator className="bg-white/20 flex-1 h-px" />
            </div>

            {/* Social Buttons */}
            <div className="space-y-3">
              <Button
                onClick={(e) => handleProvider(e, "google-signup")}
                variant="outline"
                className="w-full h-11 bg-white/10 border-white/20 hover:bg-white/20 text-white justify-start pl-6 relative"
              >
                <FcGoogle size={22} className="absolute left-4" />
                <span className="w-full text-center">Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                onClick={(e) => handleProvider(e, "facebook-signup")}
                className="w-full h-11 bg-white/10 border-white/20 hover:bg-white/20 text-white justify-start pl-6 relative"
              >
                <FaFacebook
                  size={22}
                  className="absolute left-4 text-blue-500"
                />
                <span className="w-full text-center">
                  Continue with Facebook
                </span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 bg-white/10 border-white/20 hover:bg-white/20 text-white justify-start pl-6 relative"
              >
                <FaApple size={22} className="absolute left-4" />
                <span className="w-full text-center">
                  Continue with Apple ID
                </span>
              </Button>
            </div>

            <p className="text-center text-sm mt-6 text-gray-300">
              Already have an account?
              <Link
                href="/Login"
                className="text-blue-500   hover:text-[#0c1ba1] ml-2 font-semibold"
              >
                Sign In
              </Link>
            </p>
            <p className="text-center text-xs mt-6 text-gray-400 leading-relaxed">
              By creating an account, you agree to our
              <Link
                href="#"
                className="text-blue-500 hover:underline font-medium"
              >
                Terms of Service
              </Link>
              &
              <Link
                href="#"
                className="text-blue-500 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div
        className="
          hidden lg:flex
          w-1/2
          items-center justify-center
          bg-cover bg-center
          text-white
        "
        style={{
          backgroundImage: "url('/Images/login-bg.jpg')",
        }}
      >
        <h1
          className={` font-bold drop-shadow-lg ${spaceGrotesk.className} text-2xl`}
        >
          Welcome to your personal book galaxy. <br />
          Sign up to save, track, and explore your favorite reads.
        </h1>
      </div>
    </div>
  );
}

export default Page;
