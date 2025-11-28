"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";

export default function InterestList() {
  const categories = [
    "Fiction",
    "Mystery",
    "Romance",
    "Fantasy",
    "Science Fiction",
    "Thriller",
    "Historical",
    "Biography",
    "Self-Help",
    "Business",
    "Philosophy",
    "Psychology",
    "Horror",
    "Poetry",
    "Adventure",
    "Comics",
    "Travel",
    "Cooking",
    "Art",
    "Education",
  ];

  const [selected, setSelected] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);

  const toggleCategory = (cat: string) => {
    if (selected.includes(cat)) {
      setSelected(selected.filter((c) => c !== cat));
    } else {
      setSelected([...selected, cat]);
    }
  };
  const handleSubmit = () => {};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0d1a2d] px-4"
      style={{ backgroundImage: "url('/Images/login-bg.jpg')" }}
    >
      <form
        className="
          bg-[#0b0b0b] p-10 rounded-2xl w-full max-w-[480px]
          border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.4)]
        "
      >
        <h2 className="text-white text-3xl font-bold text-center mb-6">
          complete your profile
        </h2>

        {/* ⭐ Upload Circular Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {/* الدائرة نفسها */}
            <div className="w-28 h-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>

            {/* زر القلم */}
            <label className="absolute bottom-0 right-1 bg-[#2B1B72] p-2 rounded-full cursor-pointer hover:bg-[#3d257f]">
              <Edit className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-gray-400 text-sm mt-3">
            Upload your profile photo
          </p>
        </div>

        <p className="text-gray-400 text-center mb-6 leading-relaxed">
          select your intersts
        </p>

        {/* ⬆️ Selected Categories */}
        {selected.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white mb-3 text-lg font-semibold">Selected:</h3>
            <div className="flex flex-wrap gap-2">
              {selected.map((cat) => (
                <span
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="
                    px-4 py-2 bg-[#2B1B72] text-white rounded-full text-sm 
                    cursor-pointer border border-white/10 hover:bg-[#3d257f]
                  "
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 🔽 All Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories
            .filter((cat) => !selected.includes(cat))
            .map((cat) => (
              <span
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="
                  px-4 py-2 bg-white/10 text-white rounded-full 
                  cursor-pointer text-sm hover:bg-white/20
                "
              >
                {cat}
              </span>
            ))}
        </div>

        <Button className="w-full h-12 text-lg bg-[#2B1B72] hover:bg-[#3d257f] text-white">
          Submit
        </Button>

        <p className="text-gray-400 text-xs mt-6 text-center leading-relaxed">
          Your choices help us recommend stories you will actually enjoy
        </p>
      </form>
    </div>
  );
}
