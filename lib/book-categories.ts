const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Open Library subjects include multiple categories plus series and title-specific topics. */
export function getBookCategories(title: string, subjects: string[] = []): string[] {
  const cleanTitle = normalize(title);
  const candidates = subjects.flatMap((subject) => subject.split(" / ")[0].split(","))
    .map((subject) => subject.replace(/\s*\([^)]*\)\s*/g, " ").trim())
    .filter(Boolean)
    .filter((subject) => {
      const lower = subject.toLocaleLowerCase();
      if (lower.startsWith("series:") || lower.startsWith("subject:") || lower.startsWith("people named")) return false;
      const baseSubject = normalize(subject);
      if (!baseSubject || baseSubject === cleanTitle) return false;
      if (cleanTitle.length > 2 && (baseSubject.includes(cleanTitle) || cleanTitle.includes(baseSubject))) return false;
      return true;
    });

  const unique = new Map<string, string>();
  for (const category of candidates) {
    const key = normalize(category);
    if (key && !unique.has(key)) unique.set(key, category);
  }
  return [...unique.values()].slice(0, 5).length ? [...unique.values()].slice(0, 5) : ["General"];
}
