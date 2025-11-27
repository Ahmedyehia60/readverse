"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "If this email is registered, a reset link has been sent to your inbox."
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a2d] px-4"    style={{
          backgroundImage: "url('/Images/login-bg.jpg')",
        }}>
      
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
          Forgot your password? No worries.  
          Enter the email associated with your account and we&apos;ll send you a
          password reset link.
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
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button className="w-full h-12 text-lg bg-[#2B1B72] hover:bg-[#3d257f] text-white">
          Send Reset Link
        </Button>

        <p className="text-gray-400 text-xs mt-6 text-center leading-relaxed">
          If this email is associated with an account, 
          you will receive a password reset link shortly.  
          We do not disclose whether an email is registered for security reasons.
        </p>
      </form>
    </div>
  );
}
