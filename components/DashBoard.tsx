"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import UserButton from "./UserButton";
import { toast } from "sonner";
import { BookItem, IBridge, ICategory } from "@/models/users";
import { getTwoRandomFullCategories } from "@/lib/mindmap-utils";
import { MindMapCanvas } from "./dashboard/MindMapCanvas";
import { SearchModal } from "./dashboard/SearchModal";
import { CategoryDetailModal } from "./dashboard/CategoryDetailModal";
import { SidebarWrapper } from "./dashboard/SidebarWrapper";

// ==================Types==========================

// Fetch mapped books from API
const fetchMappedBooks = async (cat1: string, cat2: string) => {
  const res = await fetch(
    `/api/mapping?category1=${encodeURIComponent(
      cat1
    )}&category2=${encodeURIComponent(cat2)}`
  );
  if (!res.ok) throw new Error("Mapping API failed");
  return res.json();
};

// ==================DashBoard Component==========================
function DashBoard() {
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);
  const [bridges, setBridges] = useState<IBridge[]>([]);
  const [mindMap, setMindMap] = useState<ICategory[]>([]);
  // Fetch MindMap
  const fetchMindMap = async () => {
    const res = await fetch("/api/books", { method: "GET" });
    const data = await res.json();
    setMindMap(data.mindMap || []);
    setBridges(data.bridges || []);
  };

  useEffect(() => {
    fetchMindMap();
  }, []);

  // ==================Handle Add Book==========================
  const handleAddBook = async (book: BookItem) => {
    try {
      const payload = {
        title: book.volumeInfo.title,
        categories: book.volumeInfo.categories || [],
        image: book.volumeInfo.imageLinks?.thumbnail,
        author: book.volumeInfo.authors?.[0],
        link: book.volumeInfo.infoLink,
      };

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add book");
      }

      const data = await response.json();

      setMindMap(data.mindMap);
      const fullCats = getTwoRandomFullCategories(
        data.mindMap,
        payload.categories
      );

      if (fullCats) {
        const [c1, c2] = fullCats;
        const bridgeData = await fetchMappedBooks(c1.name, c2.name);
        if (bridgeData.books && bridgeData.books.length > 0) {
          const sortedBridge = [...bridgeData.books].sort(
            (a, b) => b.score - a.score
          );
          const recommended = sortedBridge[0];
          const recommendedTitle = recommended.volumeInfo.title;
          await fetch("/api/books", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromCategory: c1.name,
              toCategory: c2.name,
              recommendedBook: recommendedTitle,
            }),
          });
          setBridges((prev) => [
            ...prev,
            {
              fromCategory: c1.name,
              toCategory: c2.name,
              recommendedBook: recommendedTitle,
            },
          ]);
          setTimeout(() => {
            toast.info(`Smart Link Found!`, {
              description: `We found a connection: "${recommended.volumeInfo.title}" combines your interest in ${c1.name} and ${c2.name}.`,
              duration: 10000,
              action: {
                label: "View Book",
                onClick: () =>
                  window.open(recommended.volumeInfo.infoLink, "_blank"),
              },
            });
          }, 400);
        }
      }

      // Reset UI
      setShowModal(false);
      setSearchText("");
      toast.success("Book added to your mind map!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy4.jpg')" }}
    >
      <UserButton className="absolute top-5 left-9 scale-110" />

      <Button
        className="absolute top-4 right-4 p-5 bg-[#2B1B72] text-white hover:bg-blue-900 z-10"
        onClick={() => setShowModal(true)}
      >
        Add Book
      </Button>

      {/* DISPLAY MINDMAP IN UI */}
      <MindMapCanvas
        mindMap={mindMap}
        bridges={bridges}
        onCategoryClick={setActiveCategory}
      />
      {/* CATEGORY DETAIL MODAL */}
      <CategoryDetailModal
        category={activeCategory}
        onClose={() => setActiveCategory(null)}
      />
      {/* SIDE BAR */}
      <SidebarWrapper />

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddBook={handleAddBook}
      />
    </div>
  );
}

export default DashBoard;
