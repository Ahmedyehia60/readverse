"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";

//======================================================
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error");
  const [rememberMe, setRememberMe] = useState(false);

  //================== Handle Submit =======================

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      rememberMe,
    });
    if (res?.ok) {
      router.push("/");
      toast.success("Logged in successfully");
    } else if (res?.status === 401) {
      setError("Invalid email or password");
      setPending(false);
    } else {
      setError("Something went wrong");
    }
  };

  //================== Handle Social Login =======================

  const handleProvider = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: "google-signin" | "apple" | "facebook-signin"
  ) => {
    event.preventDefault();
    signIn(value, { callbackUrl: "/" });
  };

  useEffect(() => {
    if (errorType === "NoAccount") {
      toast.error("This account is not registered. Please sign up first.");
    }
  }, [errorType]);

  //================== JSX ======================
  return (
    <div className="min-h-screen flex bg-[#0d1a2d]">
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
          WELCOME BACK!
        </h1>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#0b0b0b]">
        <div className="absolute top-4 left-4 flex items-center text-white z-10">
          <FaBook size={28} className="mr-2 text-blue-900" />
          <h1 className={`text-2xl font-bold ${spaceGrotesk.className}`}>
            READVerse
          </h1>
        </div>
        <Card className="w-full h-full max-w-none rounded-none bg-[#0b0b0b] border-none flex flex-col justify-center p-8 sm:p-12 scale-90">
          <CardHeader className="space-y-2 px-0">
            <CardTitle
              className={`text-center text-white text-3xl font-bold ${spaceGrotesk.className}`}
            >
              Login
            </CardTitle>
            <CardDescription
              className={`text-center text-gray-300 text-sm  ${spaceGrotesk.className}`}
            >
              Welcome back! Please login to your account.
            </CardDescription>
          </CardHeader>
          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
              <TriangleAlert />
              <p>{error}</p>
            </div>
          )}

          <CardContent className="px-0 max-w-[450px] mx-auto">
            <form className="flex flex-col gap-5" onSubmit={handelSubmit}>
              {/* =================================Email =========================================*/}
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
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="h-12 px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/*============================= Password============================= */}
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
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="h-12 px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <Button
                disabled={pending}
                className={` ${spaceGrotesk.className} w-full h-12 bg-[#2B1B72] hover:bg-[#3d257f] text-white text-lg`}
              >
                Sign In
              </Button>

              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center  gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-blue-900"
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`text-sm text-gray-300 ${spaceGrotesk.className}`}
                  >
                    Remember Me
                  </label>
                </div>
                <Link
                  href="/ForgetPassword"
                  className="text-blue-500 hover:underline text-sm font-medium"
                >
                  Forget password?
                </Link>
              </div>
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
                variant="outline"
                onClick={(e) => handleProvider(e, "google-signin")}
                className="w-full h-11 bg-white/10 border-white/20 hover:bg-white/20 text-white justify-start pl-6 relative"
              >
                <FcGoogle size={22} className="absolute left-4" />
                <span className="w-full text-center">Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                onClick={(e) => handleProvider(e, "facebook-signin")}
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
            </div>

            <p className="text-center text-sm mt-6 text-gray-300">
              Don&apos;t have an account?
              <Link
                href="/SignUp"
                className="text-blue-500   hover:text-[#0c1ba1] ml-2 font-semibold"
              >
                Sign up
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
    </div>
  );
}

export default Page;
