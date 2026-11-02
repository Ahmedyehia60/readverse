export interface IBridge {
  fromCategory: string;
  toCategory: string;
  recommendedBook: string;
  bookImage?: string;
  bookLink?: string;
}

export interface IBookItem {
  title: string;
  image?: string;
  authors?: string[];
}

export interface ICategory {
  name: string;
  image: string;
  books: IBookItem[];
  count: number;
  x: number;
  y: number;
}

export interface INotification {
  id: string;
  type: "smart-link" | "achievement";
  title: string;
  bookTitle?: string;
  bookImage?: string;
  message: string;
  categories?: [string, string];
  isRead: boolean;
  createdAt: Date;
}

export interface BookVolumeInfo {
  title: string;
  description?: string;
  infoLink?: string;
  authors?: string[];
  categories?: string[];
  imageLinks?: {
    smallThumbnail: string;
    thumbnail: string;
  };
}

export interface BookItem {
  id: string;
  volumeInfo: BookVolumeInfo;
}

export interface IFavorite {
  bookTitle: string;
  bookAuthors?: string[];
  bookImage?: string | null;
}

export interface SearchResults {
  items?: BookItem[];
  error?: string;
}
