"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  Check,
  Cpu,
  Globe,
  Heart,
  Home,
  Inbox,
  Languages,
  Layers,
  LogOut,
  Pencil,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
} from "lucide-react";
import type { BookItem } from "@/models/users";
import { SearchModal } from "@/components/dashboard/SearchModal";
import { LegacyPlanetMap } from "@/components/dashboard/LegacyPlanetMap";
import { findSmartLink } from "@/lib/smart-links";
import { getRank } from "@/constants/ranks";
import { getBookCategories } from "@/lib/book-categories";
import { useTranslations } from "@/context/LocaleContext";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import MissionControl from "@/components/profile/MissionControl";
import PlanetStats from "@/components/profile/PlanetStats";
import { AnimatePresence, motion } from "framer-motion";

type LibraryBook = {
  id: string;
  title: string;
  author: string;
  categories: string[];
  cover?: string;
  link?: string;
};
type SmartLink = {
  id: string;
  from: string;
  to: string;
  title: string;
  cover?: string;
  link?: string;
};
type Note = {
  id: string;
  title: string;
  message: string;
  bookTitle?: string;
  kind?: "smart-link" | "rank";
  linkId?: string;
  read: boolean;
  date: string;
};
type LocalData = {
  books: LibraryBook[];
  favorites: string[];
  links: SmartLink[];
  notes: Note[];
  profileName: string;
};

const STORAGE_KEY = "brain-book-static-data";
const seedBooks: LibraryBook[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    categories: ["Self-Improvement", "Psychology"],
  },
  {
    id: "creative-act",
    title: "The Creative Act",
    author: "Rick Rubin",
    categories: ["Creativity", "Art"],
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    categories: ["Productivity", "Psychology"],
  },
  {
    id: "psychology-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    categories: ["Finance", "Psychology"],
  },
];
const emptyData: LocalData = {
  books: seedBooks,
  favorites: [],
  links: [],
  notes: [],
  profileName: "Book reader",
};
const colors = ["#bfa5e8", "#90cbb9", "#e6b39f", "#d8c272", "#a5b5e6"];

export default function StaticApp() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] || "en";
  const route = segments.slice(1).join("/").toLowerCase();
  const isAr = locale === "ar";
  const profileT = useTranslations("Profile");
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<
    "checking" | "signedOut" | "signedIn" | "unavailable"
  >("checking");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [data, setData] = useState<LocalData>(emptyData);
  const [ready, setReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState<
    "connecting" | "connected" | "local"
  >("connecting");
  const saveVersion = useRef(0);
  const [query, setQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [highlightedLinkId, setHighlightedLinkId] = useState<string | null>(
    null,
  );
  const [profileName, setProfileName] = useState("Book reader");
  const [terminateCountdown, setTerminateCountdown] = useState<number | null>(null);
  const [terminateBusy, setTerminateBusy] = useState(false);
  const [terminateError, setTerminateError] = useState("");
  const terminationStarted = useRef(false);

  useEffect(() => {
    if (terminateCountdown === null || terminateBusy) return;
    if (terminateCountdown === 0) {
      if (terminationStarted.current) return;
      terminationStarted.current = true;
      setTerminateBusy(true);
      void fetch("/api/auth/account", { method: "DELETE" })
        .then(async (response) => {
          if (!response.ok) {
            const result = (await response.json().catch(() => ({}))) as { error?: string };
            throw new Error(result.error || "Account termination failed.");
          }
          if (currentUser) localStorage.removeItem(`${STORAGE_KEY}:${currentUser.id}`);
          localStorage.setItem("brain-book-local-migrated-to-postgres", "true");
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem("brain-book-static-books");
          router.replace(`/${locale}/Login`);
        })
        .catch((error: unknown) => {
          setTerminateError(error instanceof Error ? error.message : "Account termination failed.");
          setTerminateBusy(false);
          setTerminateCountdown(null);
          terminationStarted.current = false;
        });
      return;
    }
    const timer = window.setTimeout(() => {
      setTerminateCountdown((countdown) => countdown === null ? null : countdown - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [currentUser, locale, router, terminateBusy, terminateCountdown]);

  const cancelTermination = () => {
    terminationStarted.current = false;
    setTerminateCountdown(null);
    setTerminateBusy(false);
    setTerminateError("");
  };

  const text = isAr
    ? {
        home: "خريطة مكتبتي",
        favorites: "المفضلة",
        inbox: "الإشعارات",
        settings: "الإعدادات",
        profile: "الملف الشخصي",
        find: "ابحث عن كتاب",
        search: "ابحث في مكتبتك",
        add: "أضف كتابًا بالعنوان",
        books: "كتاب",
        categories: "تصنيفات",
        smartLinks: "روابط ذكية",
        empty: "لا توجد نتائج.",
        local: "مكتبتك متزامنة مع PostgreSQL.",
        readAll: "تحديد الكل كمقروء",
        remove: "حذف",
        noNotes: "لا توجد إشعارات بعد.",
        name: "اسم العرض",
        save: "حفظ",
        saved: "تم الحفظ",
        category: "التصنيف",
        details: "كتب هذا التصنيف",
        all: "كل الكتب",
        title: "Brain Book",
        subtitle: "اكتشف الروابط بين الكتب والأفكار التي تحبها.",
        back: "رجوع",
        removeFavorite: "إزالة من المفضلة",
        addFavorite: "أضف للمفضلة",
        notFound: "لم يتم العثور على الكتاب في مكتبتك.",
        uncategorized: "متنوع",
        newBook: "كتاب جديد",
        about: "تُحفظ الكتب والمفضلة والإشعارات في PostgreSQL.",
      }
    : {
        home: "My mind map",
        favorites: "Favorites",
        inbox: "Notifications",
        settings: "Settings",
        profile: "Profile",
        find: "Find books",
        search: "Search your library",
        add: "Add a book by title",
        books: "books",
        categories: "categories",
        smartLinks: "Smart links",
        empty: "Nothing matches your search.",
        local: "Your library syncs with PostgreSQL.",
        readAll: "Mark all as read",
        remove: "Remove",
        noNotes: "No notifications yet.",
        name: "Display name",
        save: "Save",
        saved: "Saved",
        category: "Category",
        details: "Books in this category",
        all: "All books",
        title: "Brain Book",
        subtitle: "See the connections between the books and ideas you love.",
        back: "Back",
        removeFavorite: "Remove from favorites",
        addFavorite: "Add to favorites",
        notFound: "This book is not in your library.",
        uncategorized: "General",
        newBook: "New book",
        about:
          "Your books, favorites, and notifications are stored in PostgreSQL.",
      };

  useEffect(() => {
    let mounted = true;
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!mounted) return;
        if (!response.ok) {
          setAuthStatus(response.status === 503 ? "unavailable" : "signedOut");
          return;
        }
        const result = (await response.json()) as {
          user: { id: string; name: string; email: string } | null;
        };
        setCurrentUser(result.user);
        setAuthStatus(result.user ? "signedIn" : "signedOut");
      })
      .catch(() => {
        if (mounted) setAuthStatus("unavailable");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setHighlightedLinkId(
      new URLSearchParams(window.location.search).get("highlight"),
    );
  }, [pathname]);

  useEffect(() => {
    if (!highlightedLinkId) return;
    const timer = window.setTimeout(() => setHighlightedLinkId(null), 8000);
    return () => window.clearTimeout(timer);
  }, [highlightedLinkId]);

  useEffect(() => {
    if (authStatus === "checking" || authStatus === "unavailable") return;
    if (!currentUser) {
      setReady(true);
      return;
    }
    let mounted = true;
    const userStorageKey = `${STORAGE_KEY}:${currentUser.id}`;
    const migrationFlagKey = "brain-book-local-migrated-to-postgres";
    const normalize = (value: Partial<LocalData>): LocalData => ({
      ...emptyData,
      ...value,
      books: (value.books ?? []).map((book) => ({
        ...book,
        categories: getBookCategories(book.title, book.categories ?? []),
      })),
      favorites: value.favorites ?? [],
      links: value.links ?? [],
      notes: value.notes ?? [],
    });
    const readLocalCopy = (): LocalData | null => {
      try {
        const saved = localStorage.getItem(userStorageKey);
        if (saved) return normalize(JSON.parse(saved) as Partial<LocalData>);
        if (localStorage.getItem(migrationFlagKey)) return null;
        const legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy) return normalize(JSON.parse(legacy) as Partial<LocalData>);
        const old = localStorage.getItem("brain-book-static-books");
        if (old) {
          const books = (
            JSON.parse(old) as Array<{
              title: string;
              author: string;
              category: string;
            }>
          ).map((book, index) => ({
            id: `local-${index}-${book.title}`,
            title: book.title,
            author: book.author,
            categories: [book.category || "General"],
          }));
          return normalize({ books });
        }
      } catch {
        /* Ignore invalid local data and use server data. */
      }
      return null;
    };

    void (async () => {
      try {
        const response = await fetch("/api/library", { cache: "no-store" });
        if (!response.ok) throw new Error("PostgreSQL is unavailable");
        const result = (await response.json()) as { data: Partial<LocalData> };
        let serverData = normalize(result.data);
        const localCopy = readLocalCopy();
        if (serverData.books.length === 0 && localCopy?.books.length) {
          serverData = localCopy;
          await fetch("/api/library", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: serverData }),
          });
        }
        if (mounted) {
          localStorage.setItem(migrationFlagKey, "true");
          setData(serverData);
          setStorageStatus("connected");
        }
      } catch {
        const localCopy = readLocalCopy();
        if (mounted) {
          if (localCopy) setData(localCopy);
          setStorageStatus("local");
        }
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authStatus, currentUser]);

  useEffect(() => {
    if (!ready || !currentUser) return;
    localStorage.setItem(
      `${STORAGE_KEY}:${currentUser.id}`,
      JSON.stringify(data),
    );
    setProfileName(data.profileName);
    const version = ++saveVersion.current;
    const timer = window.setTimeout(() => {
      void fetch("/api/library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })
        .then((response) => {
          if (version === saveVersion.current)
            setStorageStatus(response.ok ? "connected" : "local");
        })
        .catch(() => {
          if (version === saveVersion.current) setStorageStatus("local");
        });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [data, ready, currentUser]);

  const categories = useMemo(() => {
    const categoryNames = new Map<string, string>();
    const addPlanet = (name: string) => {
      const key = name.trim().toLocaleLowerCase();
      if (key) categoryNames.set(key, categoryNames.get(key) ?? name.trim());
    };
    data.books.forEach((book) =>
      addPlanet(book.categories[0] || text.uncategorized),
    );
    data.links.forEach((link) =>
      [link.from, link.to].forEach((name) => {
        if (
          data.books.some((book) =>
            book.categories.some(
              (category) =>
                category.trim().toLocaleLowerCase() ===
                name.trim().toLocaleLowerCase(),
            ),
          )
        )
          addPlanet(name);
      }),
    );
    return [...categoryNames.entries()].map(([key, name]) => ({
      name,
      books: data.books.filter((book) =>
        book.categories.some(
          (category) => category.trim().toLocaleLowerCase() === key,
        ),
      ),
    }));
  }, [data.books, data.links, text.uncategorized]);
  const mindMapNodes = useMemo(
    () =>
      categories.map((category, index) => ({
        ...category,
        x: 150 + (index % 3) * 350,
        y: 100 + Math.floor(index / 3) * 220,
      })),
    [categories],
  );
  const active = route.split("/")[0];
  const bookRouteTitle =
    active === "book" ? decodeURIComponent(segments.slice(2).join("/")) : "";
  const bookDetail = data.books.find(
    (book) => book.title.toLowerCase() === bookRouteTitle.toLowerCase(),
  );
  const selectedBook = selectedCategory
    ? data.books.filter((book) =>
        book.categories.some(
          (category) =>
            category.trim().toLocaleLowerCase() ===
            selectedCategory.trim().toLocaleLowerCase(),
        ),
      )
    : [];
  const unreadCount = data.notes.filter((note) => !note.read).length;
  const matchingBooks = data.books.filter((book) =>
    `${book.title} ${book.author} ${book.categories.join(" ")}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const shownBooks =
    active === "favorites"
      ? matchingBooks.filter((book) => data.favorites.includes(book.id))
      : active === "book"
        ? bookDetail
          ? [bookDetail]
          : []
        : selectedCategory
          ? selectedBook
          : matchingBooks;

  const addNote = (note: Omit<Note, "id" | "read" | "date">) =>
    setData((current) => ({
      ...current,
      notes: [
        {
          ...note,
          id: crypto.randomUUID(),
          read: false,
          date: new Date().toISOString(),
        },
        ...current.notes,
      ],
    }));

  const addBook = async (item: BookItem) => {
    const info = item.volumeInfo;
    const categories = getBookCategories(info.title, info.categories ?? []);
    const newBook: LibraryBook = {
      id: item.id,
      title: info.title,
      author:
        info.authors?.[0] ??
        (isAr
          ? "\u0645\u0624\u0644\u0641 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641"
          : "Unknown author"),
      categories: categories.length ? categories : [text.uncategorized],
      cover: info.imageLinks?.thumbnail,
      link: info.infoLink,
    };
    if (
      data.books.some(
        (book) =>
          book.id === newBook.id ||
          book.title.toLocaleLowerCase() === newBook.title.toLocaleLowerCase(),
      )
    )
      return;

    const booksAfterAdd = [newBook, ...data.books];
    setData((current) => ({ ...current, books: [newBook, ...current.books] }));

    const oldRank = getRank(data.books.length);
    const newRank = getRank(booksAfterAdd.length);
    if (oldRank.name !== newRank.name) {
      const rankName = newRank.name.replace("ranks.", "");
      addNote({
        kind: "rank",
        title: isAr
          ? "\u062a\u0631\u0642\u064a\u0629 \u062c\u062f\u064a\u062f\u0629!"
          : "Rank promotion!",
        message: isAr
          ? `\u062a\u0645\u062a \u062a\u0631\u0642\u064a\u062a\u0643 \u0625\u0644\u0649 ${rankName}.`
          : `You have been promoted to ${rankName}.`,
      });
    }

    const smartLink = await findSmartLink(
      booksAfterAdd,
      data.links,
      newBook.categories,
    );
    if (smartLink) {
      setData((current) => {
        if (
          current.links.some(
            (link) =>
              (link.from === smartLink.from && link.to === smartLink.to) ||
              (link.from === smartLink.to && link.to === smartLink.from),
          )
        )
          return current;
        const note: Note = {
          id: crypto.randomUUID(),
          kind: "smart-link",
          linkId: smartLink.id,
          title: isAr
            ? "\u062a\u0645 \u0627\u0643\u062a\u0634\u0627\u0641 \u0631\u0627\u0628\u0637 \u0630\u0643\u064a"
            : "A new smart link was found",
          message: `${smartLink.from} \u2194 ${smartLink.to}: ${smartLink.title}`,
          bookTitle: smartLink.title,
          read: false,
          date: new Date().toISOString(),
        };
        return {
          ...current,
          links: [...current.links, smartLink],
          notes: [note, ...current.notes],
        };
      });
    }
  };

  const removeBook = (book: LibraryBook) =>
    setData((current) => ({
      ...current,
      books: current.books.filter((item) => item.id !== book.id),
      favorites: current.favorites.filter((id) => id !== book.id),
      links: current.links.filter((link) => link.title !== book.title),
    }));
  const toggleFavorite = (book: LibraryBook) =>
    setData((current) => ({
      ...current,
      favorites: current.favorites.includes(book.id)
        ? current.favorites.filter((id) => id !== book.id)
        : [...current.favorites, book.id],
    }));
  const openNotification = (note: Note) => {
    setData((current) => ({
      ...current,
      notes: current.notes.map((item) =>
        item.id === note.id ? { ...item, read: true } : item,
      ),
    }));
    if (note.kind === "smart-link" && note.linkId) {
      router.push(`/${locale}?highlight=${encodeURIComponent(note.linkId)}`);
    } else if (note.kind === "rank") {
      router.push(`/${locale}/Profile`);
    }
  };
  const nav = [
    ["", text.home, Home],
    ["Favorites", text.favorites, Heart],
    ["Inbox", text.inbox, Inbox],
    ["Profile", text.profile, UserRound],
    ["Settings", text.settings, Settings],
  ] as const;
  const sectionTitle =
    active === "favorites"
      ? text.favorites
      : active === "inbox"
        ? text.inbox
        : active === "settings"
          ? text.settings
          : active === "profile"
            ? text.profile
            : active === "book"
              ? bookRouteTitle
              : (selectedCategory ?? text.home);

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const isSignup = active === "signup";
    try {
      const response = await fetch(
        `/api/auth/${isSignup ? "signup" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
          }),
        },
      );
      const result = (await response.json()) as {
        user?: { id: string; name: string; email: string };
        error?: string;
      };
      if (!response.ok || !result.user)
        throw new Error(
          result.error || (isAr ? "تعذر تسجيل الدخول." : "Could not sign in."),
        );
      setReady(false);
      setCurrentUser(result.user);
      setAuthStatus("signedIn");
      setProfileName(result.user.name);
      router.push(`/${locale}`);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : isAr
            ? "حدث خطأ."
            : "Something went wrong.",
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setAuthStatus("signedOut");
    setReady(true);
    router.push(`/${locale}/Login`);
  };

  if (authStatus === "checking")
    return (
      <main className="grid min-h-screen place-items-center bg-[#050507] text-sm text-gray-400">
        {isAr ? "جاري التحقق من الجلسة…" : "Checking your session…"}
      </main>
    );
  if (!currentUser) {
    const isSignup = active === "signup";
    const galaxyPanel = (
      <aside
        className="relative hidden min-h-screen w-1/2 items-center justify-center overflow-hidden bg-cover bg-center text-white lg:flex"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#0d1a2d]/55" />
        <h2 className="relative z-10 max-w-xl px-12 text-center text-3xl font-bold leading-relaxed drop-shadow-lg">
          {isSignup
            ? "Welcome to your personal book galaxy. Sign up to save, track, and explore your favorite reads."
            : "WELCOME BACK!"}
        </h2>
      </aside>
    );
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#0b0b0b] lg:flex">
        {!isSignup && galaxyPanel}
        <main className="relative flex min-h-screen w-full items-center justify-center px-5 py-24 text-gray-100 lg:w-1/2">
        <form
          onSubmit={submitAuth}
          className="w-full max-w-[450px] bg-transparent p-2 sm:p-8"
        >
          <Link
            href={`/${locale}`}
            className="absolute left-4 top-4 flex items-center gap-2 text-xl font-semibold sm:left-8"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-[#2B1B72]/50">
              <BookOpen size={20} />
            </span>{" "}
            Readverse
          </Link>
          <h1 className="mb-2 text-center text-3xl font-bold">
            {isSignup
              ? isAr
                ? "إنشاء حساب"
                : "Create Your Book Galaxy"
              : isAr
                ? "أهلًا بعودتك"
                : "Login"}
          </h1>
          <p className="mb-7 text-center text-sm text-gray-300">
            {isAr
              ? "سجّل الدخول لمزامنة مكتبتك عبر الأجهزة."
              : isSignup
                ? "Map your literary journey across the stars."
                : "Welcome back! Please login to your account."}
          </p>
          {isSignup && (
                <label className="mb-4 block text-sm text-gray-300">
              {isAr ? "الاسم" : "Name"}
              <input
                required
                maxLength={80}
                placeholder={isAr ? "Ø§ÙƒØªØ¨ÙŠ Ø§Ø³Ù…Ùƒ" : "Enter your name"}
                disabled={authBusy}
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-white/20 bg-white/10 px-4 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#2B1B72]"
              />
            </label>
          )}
          <label className="mb-4 block text-sm text-gray-300">
            {isAr ? "Email" : "Email Address"}
            <input
              required
              type="email"
              autoComplete="email"
              placeholder={isAr ? "Ø§ÙƒØªØ¨ÙŠ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" : "Enter your email"}
              disabled={authBusy}
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-white/20 bg-white/10 px-4 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#2B1B72]"
            />
          </label>
          <label className="mb-4 block text-sm text-gray-300">
            {isAr ? "كلمة المرور" : "Password"}
            <input
              required
              type="password"
              minLength={isSignup ? 8 : 1}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isAr ? "Ø§ÙƒØªØ¨ÙŠ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" : "Enter your password"}
              disabled={authBusy}
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-white/20 bg-white/10 px-4 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#2B1B72]"
            />
          </label>
          {(authError || authStatus === "unavailable") && (
            <p
              role="alert"
              className="mb-4 rounded-md bg-rose-500/10 p-3 text-sm text-rose-300"
            >
              {authError ||
                (isAr
                  ? "قاعدة البيانات غير متاحة. شغّل PostgreSQL وحاول مجددًا."
                  : "Database unavailable. Start PostgreSQL and try again.")}
            </p>
          )}
          <button
            disabled={authBusy || authStatus === "unavailable"}
            className="h-12 w-full rounded-md bg-[#2B1B72] text-lg font-semibold text-white transition hover:bg-[#3d257f] disabled:opacity-60"
          >
            {authBusy
              ? isAr
                ? "جاري التحميل…"
                : "Please wait…"
              : isSignup
                ? isAr
                  ? "إنشاء الحساب"
                  : "Sign Up"
                : isAr
                  ? "تسجيل الدخول"
              : "Sign In"}
          </button>
          <p className="mt-6 text-center text-sm text-gray-400">
            {isSignup
              ? isAr
                ? "لديك حساب بالفعل؟"
                : "Already have an account?"
              : isAr
                ? "ليس لديك حساب؟"
                : "New to Readverse?"}{" "}
            <Link
              className="ml-1 font-semibold text-blue-400 hover:text-blue-300"
              href={`/${locale}/${isSignup ? "Login" : "SignUp"}`}
            >
              {isSignup
                ? isAr
                  ? "تسجيل الدخول"
                  : "Sign in"
                : isAr
                  ? "إنشاء حساب"
                  : "Create account"}
            </Link>
          </p>
          {isSignup && (
            <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
              By creating an account, you agree to our{" "}
              <Link href={`/${locale}/TermsAndConditions`} className="font-medium text-blue-400 hover:underline">Terms of Service</Link>
              {" & "}
              <Link href={`/${locale}/PrivacyPolicy`} className="font-medium text-blue-400 hover:underline">Privacy Policy</Link>
            </p>
          )}
        </form>
        </main>
        {isSignup && galaxyPanel}
      </div>
    );
  }

  const isSpaceSection =
    active === "profile" ||
    active === "settings" ||
    active === "favorites" ||
    active === "inbox";
  return (
    <main
      onClick={() => {
        if (highlightedLinkId) setHighlightedLinkId(null);
      }}
      dir={isAr ? "rtl" : "ltr"}
      className="readverse-app relative min-h-screen bg-[#050507] text-white"
      style={{
        backgroundImage: `url('/images/${isSpaceSection ? "galaxy3.jpg" : "galaxy4.jpg"}')`,
        backgroundRepeat: isSpaceSection ? "no-repeat" : "repeat",
        backgroundSize: isSpaceSection ? "cover" : "auto",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <aside
        className="readverse-sidebar fixed inset-y-0 left-0 right-auto z-30 hidden w-64 flex-col border-r border-white/10 px-5 py-7 backdrop-blur-2xl md:flex rtl:left-auto rtl:right-0"
      >
        <Link
          href={`/${locale}`}
          className="mb-12 flex items-center gap-3 text-xl font-semibold tracking-tight"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-[#2B1B72]/50">
            <BookOpen size={20} />
          </span>
          <span>READVERSE</span>
        </Link>
        <nav className="space-y-2">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={`/${locale}${href ? `/${href}` : ""}`}
              title={label}
              className={`readverse-nav-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active.toLowerCase() === href.toLowerCase() ? "bg-[#2B1B72]/35 font-semibold text-purple-100" : "text-gray-400 hover:bg-white/5"}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "Inbox" && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-[#2B1B72] px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => void signOut()}
          className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-rose-500/10 hover:text-rose-300 ${active === "" ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {active !== "" && (isAr ? "تسجيل الخروج" : "Sign out")}
        </button>
        {active !== "" && (
          <div className="mt-auto rounded-2xl bg-black/40 p-4 text-xs leading-5 text-gray-400">
            {text.local}
            <div className="mt-2">
              {data.books.length} {text.books} · {categories.length}{" "}
              {text.categories}
            </div>
          </div>
        )}
      </aside>

      <section
          className="readverse-content min-h-screen px-5 pb-28 pt-6 md:ml-64 md:mr-0 md:px-10 md:pt-8 xl:px-14 rtl:md:ml-0 rtl:md:mr-64"
      >
        {active !== "" &&
          active !== "profile" &&
          active !== "settings" &&
          active !== "favorites" &&
          active !== "inbox" && (
            <header className="mb-10 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium tracking-wide text-gray-500">
                  {text.title.toUpperCase()}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {storageStatus === "connected"
                    ? "PostgreSQL · readverse"
                    : storageStatus === "connecting"
                      ? isAr
                        ? "جاري الاتصال بقاعدة البيانات…"
                        : "Connecting to PostgreSQL…"
                      : isAr
                        ? "حفظ محلي مؤقت"
                        : "Local backup · database offline"}
                </div>
              </div>
              <Link
                href={`/${isAr ? "en" : "ar"}${route ? `/${route}` : ""}`}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-[#100d1c] px-4 py-2 text-sm"
              >
                <Languages size={16} />
                {isAr ? "English" : "العربية"}
              </Link>
            </header>
          )}
        {active !== "" &&
          active !== "profile" &&
          active !== "settings" &&
          active !== "favorites" &&
          active !== "inbox" && (
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-purple-300">
                  {text.subtitle}
                </p>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  {sectionTitle}
                </h1>
              </div>
              {active === "inbox" && (
                <button
                  onClick={() =>
                    setData((current) => ({
                      ...current,
                      notes: current.notes.map((note) => ({
                        ...note,
                        read: true,
                      })),
                    }))
                  }
                  className="rounded-xl border border-white/15 bg-[#100d1c] px-4 py-2 text-sm"
                >
                  {text.readAll}
                </button>
              )}
            </div>
          )}

        {active !== "profile" &&
          active !== "settings" &&
          active !== "favorites" &&
          active !== "inbox" && (
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#100d1c] px-4 py-3 text-gray-400">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={text.search}
                  className="w-full bg-transparent text-sm text-gray-100 outline-none"
                />
              </label>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-[#2B1B72]/35 px-5 text-sm font-medium text-purple-100"
              >
                <Search size={17} />
                {text.find}
              </button>
            </div>
          )}

        {active === "inbox" ? (
          <InboxView
            notes={data.notes}
            links={data.links}
            isAr={isAr}
            text={text}
            onOpen={openNotification}
            onReadAll={() =>
              setData((current) => ({
                ...current,
                notes: current.notes.map((note) => ({ ...note, read: true })),
              }))
            }
          />
        ) : active === "settings" ? (
          <div className="relative mx-auto max-w-4xl pb-24">
            <button
              onClick={() => router.back()}
              className="group mb-6 flex w-fit items-center gap-2 text-gray-400 transition hover:text-white"
            >
              <span className="rounded-full border border-white/10 bg-white/5 p-2 transition group-hover:border-[#4c3ba8]/50 group-hover:bg-[#4c3ba8]/20">
                <ArrowLeft size={18} className="rtl:-scale-x-100" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[.2em]">
                {text.back}
              </span>
            </button>
            <header className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.025] p-8 backdrop-blur-md">
              <Cpu
                size={120}
                className="absolute right-4 top-4 opacity-[.06]"
              />
              <div className="flex items-center gap-6">
                <div className="rounded-2xl border border-[#4c3ba8]/30 bg-[#4c3ba8]/20 p-6 shadow-[0_0_20px_rgba(76,59,168,.2)]">
                  <Settings className="text-[#8d7be0]" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tight">
                    {text.settings} <span className="text-[#8d7be0]">CORE</span>
                  </h2>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="size-2 animate-pulse rounded-full bg-green-500" />
                    <p className="text-[10px] font-mono uppercase tracking-[.2em] text-gray-500">
                      {text.about}
                    </p>
                  </div>
                </div>
              </div>
            </header>
            <section className="mb-10">
              <div className="mb-6 flex items-center gap-3 px-4">
                <Globe size={18} className="text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-300">
                  {isAr ? "الواجهة واللغة" : "Interface"}
                </h3>
                <div className="ml-3 h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
              </div>
              <div className="rounded-[2rem] border border-white/5 bg-white/[.025] p-2 transition hover:bg-white/[.04]">
                <div className="rounded-[1.75rem] border border-white/5 bg-[#120d2b]/60 p-8 shadow-2xl backdrop-blur-2xl">
                  <h4 className="mb-8 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.3em] text-gray-400">
                    <Sparkles size={14} />
                    {isAr ? "إعدادات الواجهة" : "Interface settings"}
                  </h4>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-bold">
                        {isAr ? "لغة التطبيق" : "Application language"}
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {isAr ? "العربية" : "English"}
                      </p>
                    </div>
                    <div className="flex h-10 w-24 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1">
                      <Link
                        href={`/ar/Settings`}
                        className={`grid flex-1 place-items-center rounded-xl text-[10px] font-black ${isAr ? "bg-gray-500/40 text-white" : "text-gray-500"}`}
                      >
                        AR
                      </Link>
                      <Link
                        href={`/en/Settings`}
                        className={`grid flex-1 place-items-center rounded-xl text-[10px] font-black ${!isAr ? "bg-gray-500/40 text-white" : "text-gray-500"}`}
                      >
                        EN
                      </Link>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-white/5 pt-6 text-xs text-gray-500">
                    {storageStatus === "connected"
                      ? "PostgreSQL · readverse"
                      : text.local}
                    <div className="mt-2">
                      {data.books.length} {text.books} · {categories.length}{" "}
                      {text.categories}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="mt-10 rounded-[2rem] border border-red-500/20 bg-red-950/20 p-6 shadow-[0_0_40px_rgba(127,29,29,.08)] sm:p-8">
              <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.25em] text-red-400">
                    <Trash2 size={15} />
                    {isAr ? "إنهاء الحساب" : "Account termination"}
                  </h3>
                  <p className="text-sm font-semibold text-red-100">
                    {isAr ? "حذف حسابك ومكتبتك نهائيًا." : "Permanently delete your account and library."}
                  </p>
                  <p className="mt-1 text-[11px] text-red-300/60">
                    {isAr ? "سيتم حذف الكتب والمفضلة والإشعارات المسجلة على حسابك." : "Your books, favorites, and notifications will be deleted."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    terminationStarted.current = false;
                    setTerminateError("");
                    setTerminateCountdown(5);
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-red-500/30 bg-red-600/10 px-8 py-4 text-[11px] font-black uppercase tracking-[.25em] text-red-300 transition hover:border-red-400 hover:bg-red-600 hover:text-white sm:w-auto"
                >
                  {isAr ? "إنهاء الحساب" : "Terminate"}
                </button>
              </div>
              {terminateError && <p role="alert" className="mt-4 text-sm text-red-300">{terminateError}</p>}
            </section>
            {terminateCountdown !== null && (
              <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-md">
                <section role="alertdialog" aria-modal="true" aria-labelledby="terminate-title" className="w-full max-w-md rounded-[2rem] border border-red-500/30 bg-[#0b081a] p-8 text-center shadow-[0_0_60px_rgba(127,29,29,.2)]">
                  <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full border border-red-500/30 bg-red-500/10 text-3xl font-black text-red-400">
                    {terminateBusy ? <span className="animate-pulse">…</span> : terminateCountdown}
                  </div>
                  <h3 id="terminate-title" className="text-xl font-black uppercase text-white">
                    {isAr ? "تأكيد إنهاء الحساب" : "Confirm termination"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {isAr ? "سيُحذف الحساب وكل بيانات مكتبته نهائيًا." : "Your account and all library data will be permanently deleted."}
                  </p>
                  <button
                    type="button"
                    onClick={cancelTermination}
                    disabled={terminateBusy}
                    className="mt-7 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-black uppercase tracking-[.25em] text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-50"
                  >
                    {terminateBusy ? (isAr ? "جارٍ الحذف…" : "Deleting…") : (isAr ? "إلغاء" : "Cancel")}
                  </button>
                </section>
              </div>
            )}
          </div>
        ) : active === "profile" ? (
          <ProfileView
            data={data}
            profileName={profileName}
            setProfileName={setProfileName}
            setData={setData}
            profileT={profileT}
            isAr={isAr}
            text={text}
          />
        ) : active === "book" ? (
          bookDetail ? (
            <BookCards
              books={[bookDetail]}
              favorites={data.favorites}
              isAr={isAr}
              text={text}
              onToggleFavorite={toggleFavorite}
              onRemove={removeBook}
            />
          ) : (
            <div className="rounded-3xl bg-[#100d1c] p-8 text-gray-400">
              {text.notFound}
            </div>
          )
        ) : active === "favorites" ? (
          <FavoritesView
            books={data.books.filter((book) =>
              data.favorites.includes(book.id),
            )}
            onRemove={toggleFavorite}
            isAr={isAr}
            text={text}
          />
        ) : selectedCategory && active !== "" ? (
          <>
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {shownBooks.length} {text.books}
              </span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-purple-100"
              >
                {text.all}
              </button>
            </div>
            <BookCards
              books={shownBooks}
              favorites={data.favorites}
              isAr={isAr}
              text={text}
              onToggleFavorite={toggleFavorite}
              onRemove={removeBook}
            />
          </>
        ) : active === "" ? (
          <>
            <section className="home-welcome mb-8 overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
              <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                    <Sparkles size={14} />
                    {isAr ? "مساحتك الهادئة للقراءة" : "Your personal reading universe"}
                  </div>
                  <h1 className="text-4xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-5xl">
                    {isAr ? "كل فكرة، لها مدار." : "Every idea has an orbit."}
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    {isAr ? "اجمع كتبك، اكتشف الروابط بينها، وشاهد مكتبتك تكبر." : "Bring your books together, discover the connections between them, and watch your library grow."}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={() => setIsSearchModalOpen(true)} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-violet-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-violet-200">
                      <Search size={17} /> {text.find}
                    </button>
                    <a href="#your-galaxy" className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/[.06] px-5 text-sm font-medium text-white transition hover:bg-white/10">
                      <Layers size={17} /> {text.home}
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[360px]">
                  <Stat value={data.books.length} label={text.books} />
                  <Stat value={categories.length} label={text.categories} />
                  <Stat value={data.links.length} label={text.smartLinks} />
                </div>
              </div>
              <div className="home-orbit home-orbit-one" aria-hidden="true" />
              <div className="home-orbit home-orbit-two" aria-hidden="true" />
            </section>
            <LegacyPlanetMap
              categories={categories}
              links={data.links}
              onSelect={setSelectedCategory}
              highlightedLinkId={highlightedLinkId}
            />
            {selectedCategory && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xl"
                onClick={() => setSelectedCategory(null)}
              >
                <div
                  className="relative max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[2.5rem] border border-white/10 bg-[#050508]/90 p-8 shadow-[0_0_80px_rgba(0,0,0,.8)] backdrop-blur-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="absolute right-6 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xl text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                  <div className="mb-8 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[.4em] text-purple-400">
                      Category Sector
                    </span>
                    <h2 className="mt-2 text-3xl font-black italic text-white">
                      {selectedCategory}
                    </h2>
                  </div>
                  <BookCards
                    books={selectedBook}
                    favorites={data.favorites}
                    isAr={isAr}
                    text={text}
                    onToggleFavorite={toggleFavorite}
                    onRemove={removeBook}
                    currentCategory={selectedCategory}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-10 grid grid-cols-3 gap-3">
              <Stat value={data.books.length} label={text.books} />
              <Stat value={categories.length} label={text.categories} />
              <Stat value={data.links.length} label={text.smartLinks} />
            </div>
            {data.links.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-lg font-semibold">
                  {text.smartLinks}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.links.map((link) => (
                    <article
                      key={link.id}
                      className="flex items-center gap-4 rounded-2xl border border-purple-400/25 bg-[#100d1c] p-4"
                    >
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#100d1c] text-purple-300">
                        <Bookmark size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-purple-300">
                          {link.from} ↔ {link.to}
                        </div>
                        <a href={link.link?.startsWith("https://openlibrary.org/") ? link.link : `https://openlibrary.org/search?q=${encodeURIComponent(link.title)}`} target="_blank" rel="noreferrer" className="block truncate font-semibold transition-colors hover:text-purple-200">
                          {link.title}
                        </a>
                      </div>
                      {link.link && (
                        <a
                          href={link.link?.startsWith("https://openlibrary.org/") ? link.link : `https://openlibrary.org/search?q=${encodeURIComponent(link.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-purple-100"
                        >
                          ↗
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{text.home}</h2>
                <span className="text-sm text-gray-500">
                  {categories.length} {text.categories}
                </span>
              </div>
              <div className="relative overflow-x-auto rounded-[2rem] border border-white/10 bg-[#100d1c]/75">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(168,139,232,.32) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                {categories.length === 0 ? (
                  <p className="relative m-6 rounded-2xl bg-[#100d1c]/80 p-8 text-gray-400">
                    {text.empty}
                  </p>
                ) : (
                  <div
                    className="relative min-w-[800px]"
                    style={{
                      height: `${Math.max(1, Math.ceil(mindMapNodes.length / 3)) * 220 + 80}px`,
                    }}
                  >
                    <svg
                      className="pointer-events-none absolute inset-0 size-full"
                      viewBox={`0 0 1000 ${Math.max(1, Math.ceil(mindMapNodes.length / 3)) * 220 + 80}`}
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <marker
                          id="brain-book-arrow"
                          markerWidth="8"
                          markerHeight="8"
                          refX="6"
                          refY="3"
                          orient="auto"
                        >
                          <path d="M0,0 L0,6 L7,3 z" fill="#a78bfa" />
                        </marker>
                      </defs>
                      {data.links.map((link) => {
                        const from = mindMapNodes.find(
                          (node) => node.name === link.from,
                        );
                        const to = mindMapNodes.find(
                          (node) => node.name === link.to,
                        );
                        if (!from || !to) return null;
                        return (
                          <g key={link.id}>
                            <line
                              x1={from.x}
                              y1={from.y}
                              x2={to.x}
                              y2={to.y}
                              stroke="#a78bfa"
                              strokeWidth="3"
                              strokeDasharray="7 7"
                              markerEnd="url(#brain-book-arrow)"
                            />
                            <foreignObject
                              x={(from.x + to.x) / 2 - 85}
                              y={(from.y + to.y) / 2 - 14}
                              width="170"
                              height="28"
                            >
                              <div className="truncate rounded-full border border-purple-400/25 bg-[#100d1c] px-2 py-1 text-center text-[10px] text-purple-200">
                                {link.title}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                    {mindMapNodes.map((node, index) => (
                      <button
                        key={node.name}
                        onClick={() => setSelectedCategory(node.name)}
                        className="absolute flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-3xl border border-white/10 bg-[#100d1c]/95 p-4 shadow-md transition hover:scale-105 hover:shadow-xl"
                        style={{ left: `${node.x / 10}%`, top: `${node.y}px` }}
                      >
                        <span
                          className="grid size-14 place-items-center rounded-2xl text-white"
                          style={{ background: colors[index % colors.length] }}
                        >
                          <BookOpen size={23} />
                        </span>
                        <span className="max-w-full truncate text-sm font-semibold">
                          {node.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {node.books.length} {text.books}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
            <section id="your-galaxy" className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{text.all}</h2>
                <span className="text-sm text-gray-500">
                  {matchingBooks.length} {text.books}
                </span>
              </div>
              <BookCards
                books={matchingBooks}
                favorites={data.favorites}
                isAr={isAr}
                text={text}
                onToggleFavorite={toggleFavorite}
                onRemove={removeBook}
              />
            </section>
          </>
        )}
      </section>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddBook={(book) => {
          void addBook(book);
          setIsSearchModalOpen(false);
        }}
      />
      {selectedCategory && active !== "" && (
        <button
          aria-label={text.back}
          onClick={() => setSelectedCategory(null)}
          className="fixed bottom-5 right-5 z-20 rounded-full bg-[#2B1B72] px-5 py-3 text-sm text-white shadow-lg"
        >
          {text.back}
        </button>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-white/10 bg-[#100d1c]/90 px-2 py-3 backdrop-blur-lg md:hidden">
        {nav.slice(0, 4).map(([href, label, Icon]) => (
          <Link
            key={href}
            aria-label={label}
            href={`/${locale}${href ? `/${href}` : ""}`}
            className={`relative grid size-11 place-items-center rounded-xl ${active.toLowerCase() === href.toLowerCase() ? "bg-[#2B1B72]/35 text-purple-100" : "text-gray-500"}`}
          >
            <Icon size={19} />
            {href === "Inbox" && unreadCount > 0 && (
              <span className="absolute right-0 top-0 size-2 rounded-full bg-rose-500" />
            )}
          </Link>
        ))}
      </nav>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#100d1c] p-4 md:p-5">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function googleBooksUrl(book: Pick<LibraryBook, "title" | "author">) {
  const query = [book.title, book.author].filter(Boolean).join(" ");
  return `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(query)}`;
}

function ProfileView({
  data,
  profileName,
  setProfileName,
  setData,
  profileT,
  isAr,
  text,
}: {
  data: LocalData;
  profileName: string;
  setProfileName: (name: string) => void;
  setData: React.Dispatch<React.SetStateAction<LocalData>>;
  profileT: (key: string, values?: Record<string, string | number>) => string;
  isAr: boolean;
  text: Record<string, string>;
}) {
  const [editing, setEditing] = useState(false);
  const categoryCounts = new Map<string, number>();
  data.books.forEach((book) =>
    book.categories.forEach((category) =>
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1),
    ),
  );
  const topCategory = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];
  const rank = getRank(data.books.length);
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div className="flex items-center justify-between p-4">
        <p className="text-xl font-black tracking-[.3em] text-white/80">
          {profileT("interfaceTitle")}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold transition-all hover:bg-white/10"
        >
          <Pencil size={14} />
          <span>{profileT("modifyBtn")}</span>
        </button>
      </div>
      <UserProfileHeader
        user={{ name: profileName || "Book reader", image: "" }}
        rank={rank}
        t={profileT}
      />
      <div className="flex flex-col items-center">
        <MissionControl
          rank={rank}
          numOfBooks={data.books.length}
          t={profileT}
        />
        <PlanetStats
          numOfBooks={data.books.length}
          numOfCategories={categoryCounts.size}
          topCategory={{
            title: topCategory?.[0] ?? profileT("stats.noData"),
            count: topCategory?.[1] ?? 0,
          }}
          t={profileT}
        />
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const name = profileName.trim() || "Book reader";
              setData((current) => ({ ...current, profileName: name }));
              setProfileName(name);
              setEditing(false);
            }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#120d2b] p-8 shadow-[0_20px_50px_rgba(0,0,0,.5)]"
          >
            <h3 className="mb-2 text-2xl font-bold">
              {isAr ? "تعديل الملف الشخصي" : "Modify profile"}
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              {isAr
                ? "حدّث الاسم الظاهر في ملفك."
                : "Update the name shown on your profile."}
            </p>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {text.name}
              <input
                autoFocus
                maxLength={80}
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-indigo-500/50"
              />
            </label>
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button className="rounded-xl bg-indigo-600 px-7 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20">
                {text.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function FavoritesView({
  books,
  onRemove,
  isAr,
  text,
}: {
  books: LibraryBook[];
  onRemove: (book: LibraryBook) => void;
  isAr: boolean;
  text: Record<string, string>;
}) {
  return (
    <div className="-mx-5 min-h-[calc(100vh-5rem)] px-5 py-10 text-white md:-mx-12 md:px-12">
      <header className="mb-16 text-start">
        <h2 className="text-3xl font-black text-white/90">
          {isAr ? "قائمة المفضلة" : "Favourite List"}
        </h2>
        <p className="mt-2 text-xl text-white/80">
          {isAr ? "كتبك المفضلة في مدارك." : "Your favorite books orbit here."}
        </p>
      </header>
      {!books.length ? (
        <p className="mt-20 text-center text-gray-400">
          {isAr
            ? "لا توجد كتب مفضلة بعد."
            : "Your favorites are still waiting to be discovered."}
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-20">
          <AnimatePresence mode="popLayout">
            {books.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                className="group relative flex flex-col items-center"
              >
                <button
                  aria-label={text.removeFavorite}
                  title={text.removeFavorite}
                  onClick={() => onRemove(book)}
                  className="absolute right-4 top-0 z-30 rounded-full border border-red-500/30 bg-red-500/10 p-2 text-red-500 opacity-0 shadow-lg shadow-red-500/20 backdrop-blur-md transition-all duration-300 hover:bg-red-600 hover:text-white group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <div className="relative flex h-56 w-72 items-center justify-center">
                  <svg
                    width="240"
                    height="110"
                    viewBox="0 0 220 110"
                    className="absolute"
                  >
                    <ellipse
                      cx="110"
                      cy="55"
                      rx="120"
                      ry="45"
                      fill="none"
                      stroke="rgba(168,85,247,0.4)"
                      strokeWidth="1.4"
                      transform="rotate(-13 110 55)"
                    />
                    <circle r="4.5" fill="#a855f7">
                      <animateMotion
                        dur="7s"
                        repeatCount="indefinite"
                        path="M 15 55 a 95 35 -13 1 0 190 0 a 95 35 -13 1 0 -190 0"
                      />
                    </circle>
                  </svg>
                  <a
                    href={googleBooksUrl(book)}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 block h-50 w-34 cursor-pointer shadow-2xl transition-all duration-500 group-hover:scale-110"
                  >
                    <img
                      src={book.cover || "/placeholder.png"}
                      className="h-full w-full rounded-sm border border-white/10 object-cover"
                      alt={book.title}
                    />
                  </a>
                </div>
                <div className="mt-5 max-w-44 text-center">
                  <a
                    href={googleBooksUrl(book)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <h3 className="line-clamp-1 cursor-pointer text-[13px] font-bold text-white transition-colors hover:underline group-hover:text-purple-300">
                      {book.title}
                    </h3>
                  </a>
                  <p className="text-[10px] uppercase tracking-tighter text-gray-500">
                    {book.author ||
                      (isAr ? "مؤلف غير معروف" : "Unknown Author")}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function InboxView({
  notes,
  links,
  isAr,
  text,
  onOpen,
  onReadAll,
}: {
  notes: Note[];
  links: SmartLink[];
  isAr: boolean;
  text: Record<string, string>;
  onOpen: (note: Note) => void;
  onReadAll: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen p-6 text-white selection:bg-[#4c3ba8]/30 md:p-8">
      <button
        onClick={() => router.back()}
        className="group mb-6 flex w-fit items-center gap-2 text-gray-400 transition-colors hover:text-white"
      >
        <span className="rounded-full border border-white/10 bg-white/5 p-2 transition-all group-hover:border-[#4c3ba8]/50 group-hover:bg-[#4c3ba8]/20">
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1 rtl:-scale-x-100"
          />
        </span>
        <span className="text-xs font-bold uppercase tracking-[.2em]">
          {text.back}
        </span>
      </button>
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex items-end justify-between gap-5 border-b border-white/5 pb-6">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-black uppercase italic tracking-tighter">
              <Sparkles className="text-[#8d7be0]" size={28} />
              {isAr ? "الإشعارات" : "Notifications"}
            </h2>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-[.3em] text-gray-500">
              {isAr
                ? "إشارات جديدة من مكتبتك"
                : "New signals from your library"}
            </p>
          </div>
          <button
            onClick={onReadAll}
            className="shrink-0 rounded-lg border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            {isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
          </button>
        </header>
        <div className="space-y-4">
          {notes.length ? (
            notes.map((note) => {
              const smartLink = note.linkId
                ? links.find((link) => link.id === note.linkId)
                : undefined;
              const isRank = note.kind === "rank";
              const cover = smartLink?.cover;
              return (
                <article
                  key={note.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${note.read ? "border-white/5 bg-white/[.01]" : "border-white/10 bg-white/[.03] shadow-lg shadow-purple-900/5 hover:border-[#4c3ba8]/40 hover:bg-[#4c3ba8]/5"}`}
                >
                  <div className="relative z-10 flex items-start gap-4 md:gap-6">
                    {isRank ? (
                      <div
                        className={`shrink-0 rounded-xl border p-4 transition-all duration-500 ${note.read ? "border-white/5 bg-white/5 opacity-50" : "border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,.1)] group-hover:scale-105"}`}
                      >
                        <Trophy
                          size={32}
                          className={
                            note.read ? "text-gray-500" : "text-yellow-500"
                          }
                        />
                      </div>
                    ) : cover ? (
                      <img
                        src={cover}
                        alt=""
                        className={`h-24 w-16 shrink-0 rounded-xl border border-white/10 object-cover shadow-2xl transition-all duration-500 ${note.read ? "opacity-60 grayscale-[.5]" : "group-hover:scale-105 group-hover:border-[#4c3ba8]/50"}`}
                      />
                    ) : (
                      <div className="grid size-16 shrink-0 place-items-center rounded-xl border border-[#4c3ba8]/30 bg-[#4c3ba8]/10">
                        <Bell size={24} className="text-[#8d7be0]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span
                        className={`mb-2 inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${note.read ? "bg-white/10 text-gray-500" : isRank ? "bg-yellow-600 text-white shadow-[0_0_10px_rgba(202,138,4,.3)]" : "bg-[#4c3ba8] text-white shadow-[0_0_10px_rgba(76,59,168,.3)]"}`}
                      >
                        {note.read
                          ? isAr
                            ? "مؤرشف"
                            : "Archived"
                          : isRank
                            ? isAr
                              ? "إنجاز"
                              : "Achievement"
                            : isAr
                              ? "إشارة جديدة"
                              : "New signal"}
                      </span>
                      <h3
                        className={`mb-1 text-xl font-bold tracking-tight ${note.read ? "text-gray-400" : "text-white"}`}
                      >
                        {note.title}
                      </h3>
                      <p
                        className={`mb-3 max-w-2xl text-sm leading-relaxed ${note.read ? "text-gray-500" : "text-gray-300"}`}
                      >
                        {note.message}
                      </p>
                      {smartLink && (
                        <div
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[10px] font-bold ${note.read ? "border-white/5 text-gray-600" : "border-white/10 bg-white/5 text-indigo-300"}`}
                        >
                          <span className="uppercase">{smartLink.from}</span>
                          <ArrowRight size={10} className="opacity-30" />
                          <span className="uppercase text-[#8d7be0]">
                            {smartLink.to}
                          </span>
                        </div>
                      )}
                      <time className="mt-3 block text-[10px] text-gray-600">
                        {new Date(note.date).toLocaleString(isAr ? "ar" : "en")}
                      </time>
                    </div>
                    <button
                      onClick={() => onOpen(note)}
                      className={`shrink-0 self-center rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all md:px-6 ${note.read ? "border-white/10 bg-transparent text-gray-500 hover:border-white/30 hover:text-white" : "border-white bg-white text-black hover:border-[#4c3ba8] hover:bg-[#4c3ba8] hover:text-white hover:shadow-[0_0_20px_rgba(76,59,168,.4)]"}`}
                    >
                      {note.read
                        ? isAr
                          ? "فتح"
                          : "Open"
                        : isAr
                          ? "عرض"
                          : "Engage"}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/5 py-32 opacity-40">
              <Bell size={40} className="mb-4 text-gray-600" />
              <p className="text-sm font-bold uppercase tracking-[.4em]">
                {text.noNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookCards({
  books,
  favorites,
  isAr,
  text,
  onToggleFavorite,
  onRemove,
  currentCategory,
}: {
  books: LibraryBook[];
  favorites: string[];
  isAr: boolean;
  text: Record<string, string>;
  onToggleFavorite: (book: LibraryBook) => void;
  onRemove: (book: LibraryBook) => void;
  currentCategory?: string;
}) {
  if (!books.length)
    return (
      <p className="rounded-3xl border border-white/10 bg-[#100d1c] p-8 text-gray-400">
        {text.empty}
      </p>
    );
  const locale = isAr ? "ar" : "en";
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book, index) => (
        <article
          key={`${book.id}-${index}`}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#100d1c] p-5 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <a
            href={googleBooksUrl(book)}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <div className="mb-5 grid h-40 place-items-center overflow-hidden rounded-2xl bg-[#100d1c]">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt=""
                  className="h-full max-w-full object-contain"
                />
              ) : (
                <BookOpen
                  size={42}
                  strokeWidth={1.2}
                  className="text-purple-300"
                />
              )}
            </div>
            <div className="mb-2 truncate text-xs font-medium uppercase tracking-wider text-purple-300">
              {book.categories.join(" · ")}
            </div>
            <h3 className="mb-1 truncate text-lg font-semibold">
              {book.title}
            </h3>
            {currentCategory &&
              book.categories.filter((category) => category !== currentCategory)
                .length > 0 && (
                <span
                  title={`Also in: ${book.categories.filter((category) => category !== currentCategory).join(", ")}`}
                  className="mb-2 inline-flex cursor-help items-center gap-1 rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-1 text-[10px] text-purple-200"
                >
                  <Layers size={12} />
                  {book.categories.filter(
                    (category) => category !== currentCategory,
                  ).length + 1}{" "}
                  categories
                </span>
              )}
            <p className="truncate text-sm text-gray-500">{book.author}</p>
          </a>
          <div className="mt-4 flex justify-end gap-2">
            <button
              aria-label={
                favorites.includes(book.id)
                  ? text.removeFavorite
                  : text.addFavorite
              }
              title={
                favorites.includes(book.id)
                  ? text.removeFavorite
                  : text.addFavorite
              }
              onClick={() => onToggleFavorite(book)}
              className={`rounded-full p-2 transition hover:bg-rose-500/10 ${favorites.includes(book.id) ? "text-rose-500" : "text-gray-500"}`}
            >
              <Heart
                size={17}
                fill={favorites.includes(book.id) ? "currentColor" : "none"}
              />
            </button>
            <button
              aria-label={text.remove}
              title={text.remove}
              onClick={() => onRemove(book)}
              className="rounded-full p-2 text-gray-500 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
