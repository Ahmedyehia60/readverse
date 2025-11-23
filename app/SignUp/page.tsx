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
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

function page() {
  return (
    <div
      className="
    min-h-screen flex items-center justify-center
    //  bg-[url('/images/login-bg.jpg')]
    bg-cover bg-center
    bg-[#0e0d1f]
  "
    >
      <Card
        className="
          w-[95%] sm:w-[550px] p-12 sm:p-10
          bg-[#0d1a2d]/80 backdrop-blur-xl
          rounded-2xl shadow-xl border border-white/10
        "
      >
        <CardHeader className="space-y-2">
          <CardTitle
            className="
              text-center text-white font-bold tracking-wide
              text-3xl sm:text-4xl
              whitespace-nowrap
            "
          >
            Create Your Book Galaxy
          </CardTitle>

          <CardDescription className="text-center text-xl text-gray-400">
            Map your literary journey across the stars.
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6">
          <form className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="
                  w-full h-12
                  px-4 rounded-md
                  bg-white/10 border border-white/20
                  text-white placeholder:text-gray-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/80
                "
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="
                  w-full h-12
                  px-4 rounded-md
                  bg-white/10 border border-white/20
                  text-white placeholder:text-gray-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/80
                "
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="
                  w-full h-12
                  px-4 rounded-md
                  bg-white/10 border border-white/20
                  text-white placeholder:text-gray-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/80
                "
              />
            </div>

            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <Separator className="my-6 bg-white/20" />

          <div className="flex justify-evenly mt-2">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <FaGithub size={22} />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              <FcGoogle size={22} />
            </Button>
          </div>

          <p className="text-center text-sm mt-4 text-gray-300">
            Already have an account?
            <Link
              href="/Login"
              className="text-emerald-400 hover:underline ml-2 font-medium"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs mt-6 text-gray-400 leading-relaxed">
            By creating an account, you agree to our
            <Link
              href="#"
              className="text-emerald-400 hover:underline font-medium"
            >
              Terms of Service
            </Link>
            &
            <Link
              href="#"
              className="text-emerald-400 hover:underline font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
