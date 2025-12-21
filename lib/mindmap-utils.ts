import { ICategory } from "@/models/users";

export const MAX_BOOKS_PER_CATEGORY = 5;

export const getTwoRandomFullCategories = (
  mindMap: ICategory[],
  bookCategories: string[]
): ICategory[] | null => {
  const fullCategories = mindMap.filter((cat) => {
    let count = cat.books.length;
    const isBookInThisCat = bookCategories.some(
      (newCat) => newCat.toLowerCase() === cat.name.toLowerCase()
    );
    if (isBookInThisCat) count += 1;
    return count > 0 && count % MAX_BOOKS_PER_CATEGORY === 0;
  });

  if (fullCategories.length < 2) return null;
  const shuffled = [...fullCategories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};
