"use client";

import { useEffect, useState } from "react";
import { CirclePlus, Loader2, Search, Sparkles, X } from "lucide-react";
import type { BookItem } from "@/models/users";
import { getBookCategories } from "@/lib/book-categories";
import { useTranslations } from "@/context/LocaleContext";

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
};

const searchCache = new Map<string, BookItem[]>();
const toBookItem = (doc: OpenLibraryDoc): BookItem | null => {
  if (!doc.key || !doc.title) return null;
  const cover = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : "";

  return {
    id: doc.key,
    volumeInfo: {
      title: doc.title,
      authors: doc.author_name ?? [],
      categories: getBookCategories(doc.title, doc.subject),
      description: doc.first_publish_year ? `First published ${doc.first_publish_year}` : "",
      infoLink: `https://openlibrary.org${doc.key}`,
      imageLinks: cover ? { smallThumbnail: cover, thumbnail: cover } : undefined,
    },
  };
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: BookItem) => void;
}

export const SearchModal = ({ isOpen, onClose, onAddBook }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Dashboard");
  const query = searchText.trim().toLocaleLowerCase();

  useEffect(() => {
    if (!isOpen || !query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = searchCache.get(query);
    if (cached) {
      setResults(cached);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const fields = "key,title,author_name,first_publish_year,cover_i,subject";
        const search = async (q: string) => {
          const params = new URLSearchParams({ q, fields, limit: "20" });
          const response = await fetch(`https://openlibrary.org/search.json?${params}`, { signal: controller.signal });
          if (!response.ok) throw new Error("Book search is temporarily unavailable.");
          return (await response.json() as { docs?: OpenLibraryDoc[] }).docs ?? [];
        };
        // A title-prefix query helps Open Library find partial words, including short fragments.
        let docs = await search(`title:${query}*`);
        if (docs.length < 5) {
          const broader = await search(query);
          const seen = new Set(docs.map((doc) => doc.key));
          docs = [...docs, ...broader.filter((doc) => !seen.has(doc.key))];
        }
        const books = docs.map(toBookItem).filter((book): book is BookItem => book !== null);
        searchCache.set(query, books);
        setResults(books);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Failed to connect to Open Library.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setSearchText("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-search-title"
        className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d0925]/90 p-6 shadow-2xl sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 size-48 rounded-full bg-blue-600/30 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full bg-purple-600/30 blur-[80px]" />

        <header className="relative z-10 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-purple-500/20 p-2">
              <Sparkles aria-hidden="true" className="size-5 animate-pulse text-purple-400" />
            </span>
            <h2 id="book-search-title" className="text-2xl font-black italic tracking-tight text-white">
              {t("addBookModal.title")}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t("addBookModal.close") || "Close search"}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </header>

        <label className="group relative z-10 flex items-center overflow-hidden rounded-2xl border border-white/10 bg-[#1a1435]/80 backdrop-blur-md">
          <Search aria-hidden="true" className="ml-4 size-5 shrink-0 text-gray-400 transition-colors group-focus-within:text-purple-400" />
          <input
            type="search"
            autoFocus
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t("addBookModal.description")}
            className="w-full bg-transparent p-5 text-lg text-white outline-none placeholder:text-gray-400"
          />
        </label>

        <div className="relative z-10 mt-8 max-h-[450px] overflow-y-auto pr-2">
          {loading && <div className="mb-4 flex items-center justify-center gap-2 text-sm text-purple-300"><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Searching Open Library…</div>}
          {!query ? (
            <div className="py-12 text-center text-gray-400">
              <Search aria-hidden="true" className="mx-auto mb-4 size-10 text-purple-400" />
              <p className="text-sm font-bold tracking-widest">{t("addBookModal.scanMessage")}</p>
            </div>
          ) : results.length ? (
            <div className="grid gap-3">
              {results.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className="group flex w-full items-center rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left transition hover:border-purple-500/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  onClick={() => {
                    onAddBook(book);
                    onClose();
                  }}
                >
                  <div className="mr-5 grid size-14 shrink-0 place-items-center rounded-xl bg-purple-500/15 text-purple-300">
                    <Search aria-hidden="true" className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate text-base font-bold text-white transition-colors group-hover:text-purple-300">
                      {book.volumeInfo.title}
                    </h3>
                    <p className="truncate text-xs font-medium tracking-wide text-gray-400">
                      {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                    </p>
                  </div>
                  <CirclePlus aria-hidden="true" className="ml-4 size-6 shrink-0 text-purple-400 transition-transform group-hover:scale-110" />
                </button>
              ))}
            </div>
          ) : !loading && !error ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] py-8 text-center text-sm text-gray-400">
              {t("addBookModal.noResults") || "No books found."}
            </p>
          ) : null}
          {error && <p role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 py-8 text-center text-sm text-red-300">{error}</p>}
        </div>
      </section>
    </div>
  );
};
