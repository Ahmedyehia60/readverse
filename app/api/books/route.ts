import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User, { ICategory, IBookItem, IUser } from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const getRandomImage = (): string => {
  const totalImages = 7;
  const randomIndex = Math.floor(Math.random() * totalImages);
  return `/images/${randomIndex}.png`;
};
const generateNonOverlappingPosition = (existingCategories: ICategory[]) => {
  const MIN_DIST = 0.18;
  const MAX_ATTEMPTS = 100;
  const MIN_HEIGHT = 0.1;
  const MAX_HEIGHT = 0.9;
  const MIN_WIDTH = 0.1;
  const MAX_WIDTH = 0.9;

  let x: number;
  let y: number;
  let overlap: boolean;
  let attempts = 0;

  do {
    overlap = false;
    x = Math.random() * (MAX_WIDTH - MIN_WIDTH) + MIN_WIDTH;
    y = Math.random() * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT;

    for (const cat of existingCategories) {
      if (Math.abs(cat.x - x) < MIN_DIST && Math.abs(cat.y - y) < MIN_DIST) {
        overlap = true;
        break;
      }
    }

    attempts++;
  } while (overlap && attempts < MAX_ATTEMPTS);

  return { x, y };
};

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, categories } = (await req.json()) as {
      title: string;
      categories?: string[];
    };

    const categoriesToProcess = categories?.length
      ? categories
      : ["Uncategorized"];

    const user = (await User.findById(session.user.id)) as IUser | null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const newBookItem: IBookItem = {
      title: title.trim(),
    };

    if (!user.mindMap) user.mindMap = [];

    for (const catName of categoriesToProcess) {
      const normalizedCatName = catName.trim().toLowerCase();

      const existingCategoryIndex = user.mindMap!.findIndex(
        (c) => c.name.toLowerCase() === normalizedCatName
      );

      if (existingCategoryIndex > -1) {
        const existingCategory = user.mindMap![existingCategoryIndex];
        const bookExists = existingCategory.books.some(
          (book) => book.title.toLowerCase() === newBookItem.title.toLowerCase()
        );

        if (bookExists) {
          return NextResponse.json(
            {
              error: `Book "${title}" already exists in category "${catName}".`,
            },
            { status: 400 }
          );
        }
        existingCategory.books.push(newBookItem);
        existingCategory.count += 1;
      } else {
        const position = generateNonOverlappingPosition(user.mindMap!);
        const newCategory: ICategory = {
          name: catName.trim(),
          image: getRandomImage(),
          books: [newBookItem],
          count: 1,
          x: position.x,
          y: position.y,
        };
        user.mindMap!.push(newCategory);
      }
    }

    user.markModified("mindMap");

    await user.save();

    return NextResponse.json({
      message: "Book added successfully",
      mindMap: user.mindMap,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = (await User.findById(session.user.id)) as IUser | null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ mindMap: user.mindMap });
  } catch (error) {
    console.error("Error fetching mind map:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
