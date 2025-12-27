export const getRank = (count: number) => {
  if (count < 2)
    return {
      name: "ranks.Novice",
      color: "text-slate-400",
      next: 2,
      label: "Space Cadet",
    };
  if (count < 5)
    return {
      name: "ranks.Voyager",
      color: "text-blue-400",
      next: 5,
      label: "Pathfinder",
    };
  if (count < 9)
    return {
      name: "ranks.Explorer",
      color: "text-cyan-400",
      next: 9,
      label: "Star Tracker",
    };
  if (count < 14)
    return {
      name: "ranks.Pilot",
      color: "text-teal-400",
      next: 14,
      label: "Flight Lead",
    };
  if (count < 20)
    return {
      name: "ranks.Commander",
      color: "text-indigo-400",
      next: 20,
      label: "Fleet Officer",
    };
  if (count < 28)
    return {
      name: "ranks.Captain",
      color: "text-purple-400",
      next: 28,
      label: "Galaxy Guard",
    };
  if (count < 38)
    return {
      name: "ranks.Veteran",
      color: "text-pink-400",
      next: 38,
      label: "Cosmic Knight",
    };
  if (count < 50)
    return {
      name: "ranks.Legend",
      color: "text-orange-400",
      next: 50,
      label: "Star Master",
    };
  if (count < 65)
    return {
      name: "ranks.Mythic",
      color: "text-red-400",
      next: 65,
      label: "Universe Sage",
    };
  return {
    name: "ranks.GalacticOverlord",
    color: "text-yellow-400",
    next: null,
    label: "The Chosen One",
  };
};
export interface UserType {
  id?: string;
  name: string;
  image: string;
}

export interface RankType {
  name: string;
  color: string;
  next: number | null;
  label: string;
}

export interface TopCategoryType {
  title: string;
  count: number;
}
