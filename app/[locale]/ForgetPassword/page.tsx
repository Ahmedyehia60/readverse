"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ForgetPassword/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to send OTP");
      } else {
        toast.success("OTP has been sent to your email.");

        router.push(
          `/ForgetPassword/verify-otp?email=${encodeURIComponent(email)}`
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
          Reset Your Password
        </h2>

        <p className="text-gray-400 text-center mb-8 leading-relaxed">
          Enter the email associated with your account and we&apos;ll send you a one-time verification code.
        </p>

        <label className="text-gray-300 text-sm mb-1 block">
          Email Address
        </label>

        <input
          type="email"
          className="
            w-full h-12 mb-6 px-4 rounded-md 
            bg-white/10 text-white 
            border border-white/20 
            placeholder:text-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-900
          "
          placeholder="Enter your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          className="w-full h-12 text-lg bg-[#2B1B72] hover:bg-[#3d257f] text-white"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </div>
  );
}
