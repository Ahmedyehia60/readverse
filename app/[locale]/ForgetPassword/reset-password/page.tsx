"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!email || !otp) {
      toast.error("Missing email or OTP. Please restart the process.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ForgetPassword/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        console.error("Failed to parse JSON from API");
      }

      if (!res.ok || !data?.success) {
        const message =
          data?.message || `Failed to reset password (status ${res.status})`;
        console.error("API error:", message, "raw data:", data);
        toast.error(message);
      } else {
        toast.success("Password reset successfully");
        router.push("/Login");
      }
    } catch (error) {
      console.error("Network or frontend error:", error);
      toast.error("Network error while calling API");
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
          Create New Password
        </h2>

        <p className="text-gray-400 text-center mb-8 leading-relaxed">
          Choose a strong password that you don&apos;t use elsewhere.
        </p>

        <label className="text-gray-300 text-sm mb-1 block">New Password</label>
        <input
          type="password"
          className="
            w-full h-12 mb-4 px-4 rounded-md 
            bg-white/10 text-white 
            border border-white/20 
            placeholder:text-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-900
          "
          placeholder="Enter new password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label className="text-gray-300 text-sm mb-1 block">
          Confirm New Password
        </label>
        <input
          type="password"
          className="
            w-full h-12 mb-6 px-4 rounded-md 
            bg-white/10 text-white 
            border border-white/20 
            placeholder:text-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-900
          "
          placeholder="Confirm new password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          className="w-full h-12 text-lg bg-[#2B1B72] hover:bg-[#3d257f] text-white"
          disabled={loading}
        >
          {loading ? "Saving..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
