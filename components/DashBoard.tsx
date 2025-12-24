"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import UserButton from "./UserButton";
import { toast } from "sonner";
import { BookItem, IBridge, ICategory, IFavorite } from "@/models/users";
import { getTwoRandomFullCategories } from "@/lib/mindmap-utils";
import { MindMapCanvas } from "./dashboard/MindMapCanvas";
import { SearchModal } from "./dashboard/SearchModal";
import { CategoryDetailModal } from "./dashboard/CategoryDetailModal";
import { SidebarWrapper } from "./dashboard/SidebarWrapper";
import { SearchOverlay } from "./dashboard/SearchOverlay";

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
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/favorites", {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFavorites();
  }, []);
  // ==================Fetch MindMap==========================
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
        description: book.volumeInfo.description || "",
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

        const isAlreadyBridged = bridges.some(
          (b) =>
            (b.fromCategory === c1.name && b.toCategory === c2.name) ||
            (b.fromCategory === c2.name && b.toCategory === c1.name)
        );
        if (!isAlreadyBridged) {
          const bridgeData = await fetchMappedBooks(c1.name, c2.name);
          if (bridgeData.books && bridgeData.books.length > 0) {
            const sortedBridge = [...bridgeData.books].sort(
              (a, b) => b.score - a.score
            );
            const recommended = sortedBridge[0];
            const recommendedTitle = recommended.volumeInfo.title;
            const recommendedImage =
              recommended.bookImage ||
              recommended.volumeInfo.imageLinks?.thumbnail;
            const recommendedLink =
              recommended.bookLink || recommended.volumeInfo.infoLink;

            await fetch("/api/books", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fromCategory: c1.name,
                toCategory: c2.name,
                recommendedBook: recommendedTitle,
                bookImage: recommendedImage,
                bookLink: recommendedLink,
              }),
            });

            setBridges((prev) => [
              ...prev,
              {
                fromCategory: c1.name,
                toCategory: c2.name,
                recommendedBook: recommendedTitle,
                bookImage: recommendedImage,
                bookLink: recommendedLink,
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
      }

      // Reset UI
      setShowModal(false);
      setSearchText("");
      toast.success("Book added to your mind map!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add book"
      );
    }
  };

  const handleDeleteBook = async (categoryName: string, bookTitle: string) => {
    try {
      const res = await fetch("/api/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName, bookTitle }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setMindMap(data.mindMap);
      setBridges(data.bridges);

      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookTitle }),
      });

      setFavorites((prev) =>
        prev.filter((title) => title.bookTitle !== bookTitle)
      );

      const updatedCategory = data.mindMap.find(
        (c: ICategory) => c.name.toLowerCase() === categoryName.toLowerCase()
      );

      setActiveCategory(updatedCategory || null);

      toast.success("Book deleted successfully");
    } catch {
      toast.error("Failed to delete book");
    }
  };

  return (
    <div
      className="min-h-screen bg-center bg-repeat text-white relative"
      style={{ backgroundImage: "url('/Images/galaxy4.jpg')" }}
    >
      {isSearchOpen && (
        <SearchOverlay
          onSearch={(q) => setSearchQuery(q)}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
        />
      )}
      <UserButton className="absolute top-5 left-9 scale-110" />

      <Button
        className="absolute top-4 right-4 p-5 bg-[#2B1B72] text-white hover:bg-blue-900 z-10  cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        Add Book
      </Button>

      {/* DISPLAY MINDMAP IN UI */}
      <MindMapCanvas
        mindMap={mindMap}
        bridges={bridges}
        onCategoryClick={setActiveCategory}
        searchQuery={searchQuery}
      />
      {/* CATEGORY DETAIL MODAL */}
      <CategoryDetailModal
        category={activeCategory}
        favorites={favorites}
        setFavorites={setFavorites}
        onClose={() => setActiveCategory(null)}
        onDeleteBook={handleDeleteBook}
      />

      {/* SIDE BAR */}
      <SidebarWrapper onSearchClick={() => setIsSearchOpen(true)} />

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
