"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d1a2d] px-4"
      style={{ backgroundImage: "url('/Images/login-bg.jpg')" }}
    >
      <div className="bg-[#0b0b0b] p-10 rounded-2xl w-full max-w-[800px] border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
        <h1 className="text-white text-3xl font-bold text-center mb-6">
          Terms and conditions
        </h1>

        <p className="text-gray-400 mb-4 leading-relaxed">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our
          services.
        </p>

        <h2 className="text-white text-xl font-semibold mt-6 mb-2">
          Information We Collect
        </h2>
        <p className="text-gray-400 mb-4 leading-relaxed">
          We may collect personal information such as your name, email address,
          and interests. We use this information to improve your experience and
          recommend content you may like.
        </p>

        <h2 className="text-white text-xl font-semibold mt-6 mb-2">
          How We Use Your Data
        </h2>
        <p className="text-gray-400 mb-4 leading-relaxed">
          We use your data to personalize your experience, communicate with you,
          and enhance our services. We never share your personal information
          with third parties without your consent.
        </p>

        <h2 className="text-white text-xl font-semibold mt-6 mb-2">Security</h2>
        <p className="text-gray-400 mb-4 leading-relaxed">
          We implement industry-standard security measures to protect your data
          from unauthorized access, alteration, or disclosure.
        </p>

        <h2 className="text-white text-xl font-semibold mt-6 mb-2">
          Contact Us
        </h2>
        <p className="text-gray-400 mb-4 leading-relaxed">
          If you have any questions about this Privacy Policy, you can contact
          us at support@yoursite.com.
        </p>
      </div>
    </div>
  );
}
