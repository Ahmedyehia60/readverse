export type SmartLinkRecord = {
  id: string;
  from: string;
  to: string;
  title: string;
  cover?: string;
  link?: string;
};

export type SmartLinkBook = {
  id: string;
  title: string;
  categories: string[];
  cover?: string;
  link?: string;
};

/** Builds one new recommendation link once two categories each contain at least four books. */
export async function findSmartLink(
  books: SmartLinkBook[],
  links: SmartLinkRecord[],
  addedCategories: string[],
): Promise<SmartLinkRecord | null> {
  const counts = new Map<string, { name: string; count: number }>();
  for (const book of books) {
    const categoriesInBook = new Map<string, string>();
    for (const value of book.categories) {
      const category = value.trim();
      if (category) categoriesInBook.set(category.toLocaleLowerCase(), categoriesInBook.get(category.toLocaleLowerCase()) ?? category);
    }
    for (const [key, category] of categoriesInBook) {
      const existing = counts.get(key);
      counts.set(key, { name: existing?.name ?? category, count: (existing?.count ?? 0) + 1 });
    }
  }

  const eligible = [...counts.values()].filter(({ count }) => count > 3);
  const existingPairs = new Set(links.map(({ from, to }) => [from.toLocaleLowerCase(), to.toLocaleLowerCase()].sort().join("::")));
  const added = new Set(addedCategories.map((category) => category.toLocaleLowerCase()));
  const candidates = eligible.flatMap((from, index) => eligible.slice(index + 1).map((to) => ({ from, to })))
    .filter(({ from, to }) => !existingPairs.has([from.name.toLocaleLowerCase(), to.name.toLocaleLowerCase()].sort().join("::")))
    .sort((a, b) => Number(added.has(b.from.name.toLocaleLowerCase()) || added.has(b.to.name.toLocaleLowerCase())) - Number(added.has(a.from.name.toLocaleLowerCase()) || added.has(a.to.name.toLocaleLowerCase())));
  const pair = candidates[0];
  if (!pair) return null;

  const fromKey = pair.from.name.toLocaleLowerCase();
  const toKey = pair.to.name.toLocaleLowerCase();
  let recommendation: { title: string; cover?: string; link?: string } | undefined;
  try {
    const params = new URLSearchParams({
      q: `subject:"${pair.from.name}" subject:"${pair.to.name}"`,
      fields: "key,title,cover_i,subject",
      limit: "50",
    });
    const response = await fetch(`https://openlibrary.org/search.json?${params}`);
    if (response.ok) {
      const result = await response.json() as {
        docs?: Array<{ key?: string; title?: string; cover_i?: number; subject?: string[] }>;
      };
      const existingIds = new Set(books.map((book) => book.id.toLocaleLowerCase()));
      const existingTitles = new Set(books.map((book) => book.title.trim().toLocaleLowerCase()));
      const candidates = (result.docs ?? []).filter((book) => {
        if (!book.key || !book.title) return false;
        const id = book.key.toLocaleLowerCase();
        const title = book.title.trim().toLocaleLowerCase();
        return !existingIds.has(id) && !existingTitles.has(title);
      }).map((book) => {
        const subjects = (book.subject ?? []).map((subject) => subject.toLocaleLowerCase());
        const score = Number(subjects.some((subject) => subject.includes(fromKey))) + Number(subjects.some((subject) => subject.includes(toKey)));
        return { book, score };
      }).sort((a, b) => b.score - a.score);
      const suggested = candidates.find(({ score }) => score === 2)?.book ?? candidates.find(({ score }) => score > 0)?.book;
      if (suggested?.title && suggested.key) {
        recommendation = {
          title: suggested.title,
          cover: suggested.cover_i ? `https://covers.openlibrary.org/b/id/${suggested.cover_i}-M.jpg` : undefined,
          link: `https://openlibrary.org${suggested.key}`,
        };
      }
    }
  } catch {
    // A catalog outage should not prevent the book from being saved.
  }

  if (!recommendation) return null;
  return { id: crypto.randomUUID(), from: pair.from.name, to: pair.to.name, ...recommendation };
}
