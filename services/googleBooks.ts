export const searchGoogleBooks = async (query: string) => {
  const response = await fetch("api/search");
  const data = await response.json();
  return data;
};
