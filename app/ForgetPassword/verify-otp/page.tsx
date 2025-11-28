"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ForgetPassword/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Invalid OTP");
      } else {
        toast.success("OTP verified successfully");

        router.push(
          `/ForgetPassword/reset-password?email=${encodeURIComponent(
            email
          )}&otp=${encodeURIComponent(otp)}`
        );
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d1a2d] px-4"
      style={{ backgroundImage: "url('/Images/login-bg.jpg')" }}
    >
      <form
        onSubmit={handleSubmit}
        className="
          bg-[#0b0b0b] 
          p-10 
          rounded-2xl 
          w-full 
          max-w-[480px] 
          border border-white/10
          shadow-[0_0_25px_rgba(0,0,0,0.4)]
        "
      >
        <h2 className="text-white text-3xl font-bold text-center mb-4">
          Verify OTP
        </h2>

        <p className="text-gray-400 text-center mb-8 leading-relaxed">
          Enter the verification code that was sent to your email.
        </p>

        <label className="text-gray-300 text-sm mb-1 block">
          Email Address
        </label>
        <input
          type="email"
          className="
            w-full h-12 mb-4 px-4 rounded-md 
            bg-white/10 text-white 
            border border-white/20 
            placeholder:text-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-900
          "
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="text-gray-300 text-sm mb-1 block">
          Verification Code (OTP)
        </label>
        <input
          type="text"
          className="
            w-full h-12 mb-6 px-4 rounded-md 
            bg-white/10 text-white 
            border border-white/20 
            placeholder:text-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-900
          "
          placeholder="Enter the code you received"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button
          className="w-full h-12 text-lg bg-[#2B1B72] hover:bg-[#3d257f] text-white"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </div>
  );
}
