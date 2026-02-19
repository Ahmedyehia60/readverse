"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import UserButton from "./UserButton";
import { toast } from "sonner";
import {
  BookItem,
  IBridge,
  ICategory,
  IFavorite,
  INotification,
} from "@/models/users";
import { getTwoRandomFullCategories } from "@/lib/mindmap-utils";
import { useNotifications } from "@/context/NotficationContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { getRank } from "@/constants/ranks";

const MindMapCanvas = dynamic(
  () => import("./dashboard/MindMapCanvas").then((m) => m.MindMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050507] text-yellow-400 font-mono tracking-[0.5em] animate-pulse">
        INITIATING CORE...
      </div>
    ),
  },
);
const SearchModal = dynamic(
  () => import("./dashboard/SearchModal").then((m) => m.SearchModal),
  { ssr: false },
);
const CategoryDetailModal = dynamic(
  () =>
    import("./dashboard/CategoryDetailModal").then(
      (m) => m.CategoryDetailModal,
    ),
  { ssr: false },
);
const SearchOverlay = dynamic(
  () => import("./dashboard/SearchOverlay").then((m) => m.SearchOverlay),
  { ssr: false },
);
const SidebarWrapper = dynamic(
  () => import("./dashboard/SidebarWrapper").then((m) => m.SidebarWrapper),
  { ssr: false },
);

function DashBoard() {
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);
  const [bridges, setBridges] = useState<IBridge[]>([]);
  const [mindMap, setMindMap] = useState<ICategory[]>([]);
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  const t = useTranslations("Dashboard");
  const { addNotification } = useNotifications();

  const fetchMindMap = useCallback(async () => {
    try {
      const res = await fetch("/api/books", { method: "GET" });
      const data = await res.json();
      setMindMap(data.mindMap || []);
      setBridges(data.bridges || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchMindMap();
    fetchFavorites();
    window.addEventListener("focus", fetchFavorites);
    return () => window.removeEventListener("focus", fetchFavorites);
  }, [fetchMindMap, fetchFavorites]);

  useEffect(() => {
    if (highlightParam) {
      setActiveHighlight(highlightParam);
      const timer = setTimeout(() => {
        router.replace(pathname, { scroll: false });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightParam, pathname, router]);

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

      // 1. إضافة الكتاب
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add book");

      const data = await response.json();
      setMindMap(data.mindMap);

      // --- [لوجيك الترقية المطور - منع التكرار] ---
      const totalBooks =
        data.mindMap?.reduce(
          (sum: number, cat: ICategory) => sum + (cat.count || 0),
          0,
        ) ?? 0;

      const currentRank = getRank(totalBooks);
      // النوتيفيكيشنز اللي جاية من الداتابيز فعلياً
      const savedNotifications = data.notifications || [];

      const alreadyHasThisAchievement = savedNotifications.some(
        (n: INotification) =>
          n.type === "achievement" && n.categories?.[0] === currentRank.name,
      );

      if (totalBooks > 0 && !alreadyHasThisAchievement) {
        const achievementNote = {
          id: crypto.randomUUID(),
          type: "achievement" as const,
          title: "Promotion Unlocked!",
          message: `Commander, you've been promoted to ${currentRank.name}!`,
          categories: [currentRank.name, currentRank.label] as [string, string],
        };

        // حفظ الترقية في الداتابيز فوراً عشان المرة الجاية alreadyHas تبقى true
        await fetch("/api/books", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_ACHIEVEMENT",
            notification: achievementNote,
          }),
        });

        addNotification(achievementNote);
        toast.success(`New Rank: ${currentRank.name}`);
      }
      // --- [نهاية لوجيك الترقية] ---

      // 2. لوجيك الـ Smart Link (كما هو مع التأكد من الحفظ)
      const fullCats = getTwoRandomFullCategories(
        data.mindMap,
        payload.categories,
      );
      if (fullCats) {
        const [c1, c2] = fullCats;
        const isAlreadyBridged = bridges.some(
          (b) =>
            (b.fromCategory === c1.name && b.toCategory === c2.name) ||
            (b.fromCategory === c2.name && b.toCategory === c1.name),
        );

        if (!isAlreadyBridged) {
          const bridgeRes = await fetch(
            `/api/mapping?category1=${encodeURIComponent(c1.name)}&category2=${encodeURIComponent(c2.name)}`,
          );
          const bridgeData = await bridgeRes.json();

          if (bridgeData.books?.length > 0) {
            const recommended = [...bridgeData.books].sort(
              (a, b) => b.score - a.score,
            )[0];
            const notificationData = {
              id: crypto.randomUUID(),
              type: "smart-link" as const,
              title: "New Smart Link Found!",
              bookTitle: recommended.volumeInfo.title,
              message: `Bridge created between ${c1.name} and ${c2.name}`,
              bookImage:
                recommended.bookImage ||
                recommended.volumeInfo.imageLinks?.thumbnail,
              categories: [c1.name, c2.name] as [string, string],
            };

            await fetch("/api/books", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fromCategory: c1.name,
                toCategory: c2.name,
                recommendedBook: recommended.volumeInfo.title,
                bookImage: notificationData.bookImage,
                bookLink:
                  recommended.bookLink || recommended.volumeInfo.infoLink,
                notification: notificationData,
              }),
            });

            setBridges((prev) => [
              ...prev,
              {
                fromCategory: c1.name,
                toCategory: c2.name,
                recommendedBook: recommended.volumeInfo.title,
                bookImage: notificationData.bookImage,
                bookLink:
                  recommended.bookLink || recommended.volumeInfo.infoLink,
              },
            ]);

            addNotification(notificationData);
            toast.info(`Smart Link Found!`);
          }
        }
      }

      setShowModal(false);
      toast.success("Book added!");
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    }
  };
  const handleDeleteBook = async (categoryName: string, bookTitle: string) => {
    try {
      const res = await fetch("/api/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName, bookTitle }),
      });
      const data = await res.json();
      setMindMap(data.mindMap);
      setBridges(data.bridges);
      setFavorites((prev) => prev.filter((f) => f.bookTitle !== bookTitle));
      setActiveCategory(
        data.mindMap.find(
          (c: ICategory) => c.name.toLowerCase() === categoryName.toLowerCase(),
        ) || null,
      );
      toast.success("Deleted");
    } catch {
      toast.error("Error");
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      const res = await fetch("/api/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName }),
      });
      const data = await res.json();
      setMindMap(data.mindMap);
      setBridges(data.bridges);
      setActiveCategory(null);
      toast.success("Category removed");
    } catch {
      toast.error("Error");
    }
  };

  const backgroundStyle = useMemo(
    () => ({
      backgroundImage: "url('/images/galaxy4.jpg')",
      backgroundRepeat: "repeat",
      backgroundSize: "auto",
      backgroundAttachment: "fixed" as const,
    }),
    [],
  );

  return (
    <div
      className="min-h-screen bg-[#050507] text-white relative"
      style={backgroundStyle}
    >
      {isSearchOpen && (
        <SearchOverlay
          onSearch={setSearchQuery}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
        />
      )}

      <UserButton className="absolute top-5 left-9 scale-110" />

      <Button
        className="absolute top-4 right-4 p-5 bg-[#2B1B72]/80 backdrop-blur-md text-white hover:bg-blue-900 z-10 cursor-pointer border border-white/10"
        onClick={() => setShowModal(true)}
      >
        {t("addBook")}
      </Button>

      <MindMapCanvas
        mindMap={mindMap}
        bridges={bridges}
        onCategoryClick={setActiveCategory}
        searchQuery={searchQuery}
        highlightBook={activeHighlight}
        setHighlightBook={setActiveHighlight}
      />

      {activeCategory && (
        <CategoryDetailModal
          category={activeCategory}
          favorites={favorites}
          setFavorites={setFavorites}
          onClose={() => setActiveCategory(null)}
          onDeleteBook={handleDeleteBook}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      <SidebarWrapper onSearchClick={() => setIsSearchOpen(true)} />

      {showModal && (
        <SearchModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAddBook={handleAddBook}
        />
      )}
    </div>
  );
}

export default DashBoard;
