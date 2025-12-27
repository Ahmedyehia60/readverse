/* eslint-disable @next/next/no-img-element */
"use client";

import { X, Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface EditProfileModalProps {
  user: { name: string; image: string; id: string };
  onClose: () => void;
  onUpdate: (updatedUser: { name: string; image: string }) => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onUpdate,
}: EditProfileModalProps) {
  const t = useTranslations("Profile");
  const [newName, setNewName] = useState(user.name);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("name", newName);
    if (newImage) formData.append("image", newImage);

    try {
      const res = await fetch("/api/update-user", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.user);
        onClose();
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#120d2b] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button
          className="absolute ltr:right-6 rtl:left-6 top-6 rounded-full p-2 hover:bg-white/5 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white">
            {t("editModal.title")}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {t("editModal.description")}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group">
            <img
              src={uploadPreview || user.image || "/default-avatar.png"}
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500/50 shadow-xl"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Pencil size={20} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              {t("editModal.nameLabel")}
            </label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              {t("editModal.avatarLabel")}
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-xs text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:font-bold hover:file:bg-indigo-500 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setNewImage(file);
                if (file) setUploadPreview(URL.createObjectURL(file));
              }}
            />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition"
          >
            {t("editModal.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-black text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "..." : t("editModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
