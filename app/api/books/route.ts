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
        const newCategory: ICategory = {
          name: catName.trim(),
          image: getRandomImage(),
          books: [newBookItem],
          count: 1,
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
