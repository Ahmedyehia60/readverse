import { ICategory } from "@/models/users";

export const getTwoRandomFullCategories = (
  mindMap: ICategory[],
  bookCategories: string[]
): ICategory[] | null => {
  const eligibleCategories = mindMap.filter((cat) => {
    let count = cat.books.length;

    const isBookInThisCat = bookCategories.some(
      (newCat) => newCat.toLowerCase() === cat.name.toLowerCase()
    );
    if (isBookInThisCat) count += 1;
    return count >= 3;
  });

  if (eligibleCategories.length < 2) return null;

  const shuffled = [...eligibleCategories].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, 2);
};
