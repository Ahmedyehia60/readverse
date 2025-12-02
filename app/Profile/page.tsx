/* eslint-disable @next/next/no-img-element */
"use client";

import { Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import SidebarIcon from "@/components/SideBarIcon";

function Profile() {
  type UserType = {
    name: string;
    image: string;
  };

  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserType | null>(null);

  const [edit, setEdit] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      const res = await fetch(`/api/get-user?userId=${session.user.id}`);
      const data = await res.json();
      setUser(data.user);
      setNewName(data.user.name);
    };

    fetchUser();
  }, [session]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("userId", session?.user?.id as string);
    formData.append("name", newName);

    if (newImage) {
      formData.append("image", newImage);
    }

    const res = await fetch("/api/update-user", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      setEdit(false);
      setUploadPreview(null);
    } else {
      console.log(data.error);
    }
  };

  if (status === "loading" || !user) {
    return (
      <Loader
        bookScale={1.6}
        bookTop={-100}
        bookLeft={-40}
        text="Loading worlds..."
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy3.jpg')" }}
    >
      <SidebarIcon active="user" />
      <div className="flex justify-between items-center p-4">
        <p className="text-lg font-semibold">Profile</p>
        <button
          onClick={() => setEdit(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm hover:bg-white/10 transition"
        >
          <Pencil size={18} />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex flex-col items-center mt-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="ripple absolute w-44 h-44 rounded-full border border-white/10"></div>
          <div className="ripple absolute w-52 h-52 rounded-full border border-white/10"></div>
          <div className="ripple absolute w-60 h-60 rounded-full border border-white/10"></div>

          <img
            src={uploadPreview || user.image || "/default-avatar.png"}
            alt="User Avatar"
            className="w-32 h-32 rounded-full object-cover relative z-10 shadow-xl shadow-black/40"
          />
        </div>

        <h2 className="text-2xl font-semibold mt-9 capitalize ">{user.name}</h2>
      </div>

      {/* Edit Modal */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-gradient-to-b from-[#27214a] to-[#17122f] p-6 shadow-2xl shadow-black/60">
            {/* Close */}
            <button
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-white/10"
              onClick={() => {
                setEdit(false);
                setUploadPreview(null);
                setNewImage(null);
                setNewName(user.name);
              }}
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <h3 className="text-xl font-semibold">Edit Profile</h3>
              <p className="mt-1 text-xs text-gray-300">
                Update your display name and avatar.
              </p>
            </div>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative w-24 h-24">
                <img
                  src={uploadPreview || user.image || "/default-avatar.png"}
                  alt="Preview Avatar"
                  className="w-24 h-24 rounded-full object-cover border border-white/20 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 p-1.5 text-xs">
                  <Pencil className="w-3 h-3" />
                </div>
              </div>
              <p className="text-xs text-gray-300">
                Recommended: square image, at least 256×256.
              </p>
            </div>

            {/* Name input */}
            <div className="space-y-1 mb-5">
              <label className="block text-sm font-medium text-gray-200">
                Name
              </label>
              <input
                className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* File input */}
            <div className="space-y-1 mb-6">
              <label className="block text-sm font-medium text-gray-200">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs text-gray-300
                  file:mr-4 file:rounded-full file:border-0
                  file:bg-indigo-600 file:px-4 file:py-2
                  file:text-xs file:font-semibold
                  hover:file:bg-indigo-500
                  cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNewImage(file);

                  if (file) {
                    setUploadPreview(URL.createObjectURL(file));
                  } else {
                    setUploadPreview(null);
                  }
                }}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Supported formats: JPG, PNG, GIF. Max size: 5MB.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEdit(false);
                  setUploadPreview(null);
                  setNewImage(null);
                  setNewName(user.name);
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
