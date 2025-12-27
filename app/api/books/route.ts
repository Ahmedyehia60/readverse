import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User, { ICategory, IUser, IBridge } from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const getRandomImage = (): string => {
  const totalImages = 25;
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, categories: incomingCategories } = await req.json();
    const cleanTitle = title?.trim();

    if (!cleanTitle) {
      return NextResponse.json(
        { error: "Book title is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mindMap) user.mindMap = [];

    const alreadyExists = user.mindMap.some((cat) =>
      cat.books.some((b) => b.title.toLowerCase() === cleanTitle.toLowerCase())
    );

    if (alreadyExists) {
      return NextResponse.json(
        { error: "book already exists" },
        { status: 400 }
      );
    }
    let finalCategories: string[] = ["General"];

    if (
      incomingCategories &&
      Array.isArray(incomingCategories) &&
      incomingCategories.length > 0
    ) {
      finalCategories = incomingCategories.map((c) => c.split(" / ")[0].trim());
    }

    let isAdded = false;
    for (const catName of finalCategories.slice(0, 1)) {
      const normalizedCat = catName.trim();

      const category = user.mindMap.find(
        (c) => c.name.toLowerCase() === normalizedCat.toLowerCase()
      );

      if (category) {
        category.books.push({ title: cleanTitle });
        category.count = category.books.length;
        isAdded = true;
      } else {
        const pos = generateNonOverlappingPosition(user.mindMap);

        user.mindMap.push({
          name: normalizedCat,
          image: getRandomImage(),
          books: [{ title: cleanTitle }],
          count: 1,
          x: pos.x,
          y: pos.y,
        });

        isAdded = true;
      }
    }

    if (!isAdded) {
      return NextResponse.json(
        { error: "Failed to add book" },
        { status: 500 }
      );
    }

    user.markModified("mindMap");
    await user.save();

    return NextResponse.json({
      message: "Book added successfully",
      mindMap: user.mindMap,
    });
  } catch (error) {
    console.error("POST Error:", error);
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
    return NextResponse.json({
      mindMap: user.mindMap || [],
      bridges: user.bridges || [],
      notifications: user.notifications || [],
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "MARK_READ") {
      await User.updateOne(
        { _id: session.user.id },
        { $set: { "notifications.$[].isRead": true } }
      );
      return NextResponse.json({ message: "Notifications marked as read" });
    }

    if (body.action === "MARK_SINGLE_READ") {
      const { notificationId } = body;
      await User.updateOne(
        { _id: session.user.id, "notifications.id": notificationId },
        { $set: { "notifications.$.isRead": true } }
      );
      return NextResponse.json({
        message: "Single notification marked as read",
      });
    }

    if (body.action === "ADD_ACHIEVEMENT") {
      const { notification } = body;
      await User.updateOne(
        { _id: session.user.id },
        {
          $push: {
            notifications: {
              ...notification,
              isRead: false,
              createdAt: new Date(),
            },
          },
        }
      );
      return NextResponse.json({ message: "Achievement added successfully" });
    }

    const {
      fromCategory,
      toCategory,
      recommendedBook,
      bookImage,
      bookLink,
      notification,
    } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyExists = user.bridges.some(
      (b: IBridge) =>
        (b.fromCategory === fromCategory && b.toCategory === toCategory) ||
        (b.fromCategory === toCategory && b.toCategory === fromCategory)
    );

    if (!alreadyExists) {
      user.bridges.push({
        fromCategory,
        toCategory,
        recommendedBook,
        bookImage,
        bookLink,
      });

      if (notification) {
        user.notifications.push({
          ...notification,
          isRead: false,
          createdAt: new Date(),
        });
      }

      await user.save();
    }

    return NextResponse.json({
      message: "Operation successful",
      bridges: user.bridges,
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryName, bookTitle } = await req.json();

    if (!categoryName) {
      return NextResponse.json(
        { error: "Missing category name" },
        { status: 400 }
      );
    }

    const user = (await User.findById(session.user.id)) as IUser | null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mindMap) user.mindMap = [];

  
    if (!bookTitle) {
    
      user.mindMap = user.mindMap.filter(
        (c) => c.name.toLowerCase() !== categoryName.toLowerCase()
      );

      
      user.bridges = user.bridges.filter(
        (b: IBridge) =>
          b.fromCategory.toLowerCase() !== categoryName.toLowerCase() &&
          b.toCategory.toLowerCase() !== categoryName.toLowerCase()
      );
    }
    
    else {
      const categoryIndex = user.mindMap.findIndex(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (categoryIndex !== -1) {
        const category = user.mindMap[categoryIndex];

        category.books = category.books.filter(
          (b) => b.title.toLowerCase() !== bookTitle.toLowerCase()
        );
        category.count = category.books.length;

        
        if (category.books.length === 0) {
          user.mindMap.splice(categoryIndex, 1);
          user.bridges = user.bridges.filter(
            (b: IBridge) =>
              b.fromCategory.toLowerCase() !== categoryName.toLowerCase() &&
              b.toCategory.toLowerCase() !== categoryName.toLowerCase()
          );
        }
      } else {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    user.markModified("mindMap");
    user.markModified("bridges");
    await user.save();

    return NextResponse.json({
      message: bookTitle ? "Book deleted" : "Category deleted",
      mindMap: user.mindMap,
      bridges: user.bridges,
    });
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
