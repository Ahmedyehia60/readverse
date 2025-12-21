/* eslint-disable @next/next/no-img-element */
"use client";
import { ICategory } from "@/models/users";
import { X } from "lucide-react";

interface Props {
  category: ICategory | null;
  onClose: () => void;
}

export const CategoryDetailModal = ({ category, onClose }: Props) => {
  if (!category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col md:flex-row gap-6 p-8 rounded-2xl max-w-3xl w-full mx-4  border border-white/15 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="ripple absolute w-44 h-44 rounded-full border border-white/10 animate-ping"></div>
            <div className="ripple absolute w-52 h-52 rounded-full border border-white/5"></div>

            <img
              src={category.image || "/placeholder.png"}
              alt={category.name}
              className="w-full h-full object-cover rounded-full z-10 border-2 border-white/20"
            />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-center text-white">
            {category.name}
          </h2>
        </div>

        <div className="w-full md:w-1/2 max-h-[400px] overflow-y-auto pr-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-400">
            Books in this Category
          </h3>

          <ul className="space-y-3">
            {category.books.map((book, index) => (
              <li
                key={index}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-default text-sm text-gray-200"
              >
                {book.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
