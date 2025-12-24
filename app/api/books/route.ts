import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User, { ICategory, IUser, IBridge } from "@/models/users";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
async function classifyBook(
  title: string,
  description: string
): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const content =
      description && description.length > 10
        ? `Title: ${title}, Description: ${description}`
        : `Title: ${title}`;

    const prompt = `
      Classify this book into exactly ONE high-level genre (e.g., Sci-Fi, Fantasy, Philosophy).
      Book Info: ${content}
      Return ONLY a JSON object: {"category": "GenreName"}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = JSON.parse(text);

    if (parsed.category && typeof parsed.category === "string") {
      return [parsed.category.trim()];
    }
    return ["General"];
  } catch (error) {
    return ["General"];
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await req.json();
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

    /* 🔴 GLOBAL DUPLICATE CHECK */
    const alreadyExists = user.mindMap.some((cat) =>
      cat.books.some((b) => b.title.toLowerCase() === cleanTitle.toLowerCase())
    );

    if (alreadyExists) {
      return NextResponse.json(
        { error: "book already exists in the mind map" },
        { status: 400 }
      );
    }

    /* 🧠 GEMINI CLASSIFICATION */
    let categories = await classifyBook(cleanTitle, description || "");

    // 🛑 HARD FALLBACK
    if (!categories.length) {
      categories = ["General"];
    }

    let isAdded = false;

    for (const catName of categories.slice(0, 2)) {
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
      mindMap: user.mindMap,
      bridges: user.bridges || [],
    });
  } catch (error) {
    console.error("Error fetching mind map:", error);
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

    const { fromCategory, toCategory, recommendedBook, bookImage, bookLink } =
      await req.json();

    const user = await User.findById(session.user.id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      await user.save();
    }

    return NextResponse.json({
      message: "Bridge saved",
      bridges: user.bridges,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save bridge" },
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

    if (!categoryName || !bookTitle) {
      return NextResponse.json(
        { error: "Missing category name or book title" },
        { status: 400 }
      );
    }
    const user = (await User.findById(session.user.id)) as IUser | null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mindMap) {
      user.mindMap = [];
    }
    const categoryIndex = user.mindMap.findIndex(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const category = user.mindMap[categoryIndex];
    category.books = category.books.filter(
      (b) => b.title.toLowerCase() !== bookTitle.toLowerCase()
    );

    category.count = category.books.length;
    if (category.books.length === 0) {
      const removedCategoryName = category.name;

      user.mindMap.splice(categoryIndex, 1);

      user.bridges = user.bridges.filter(
        (b: IBridge) =>
          b.fromCategory !== removedCategoryName &&
          b.toCategory !== removedCategoryName
      );
    }
    user.markModified("mindMap");
    user.markModified("bridges");
    await user.save();

    // 9️⃣ Response
    return NextResponse.json({
      message: "Book deleted successfully",
      mindMap: user.mindMap,
      bridges: user.bridges,
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
