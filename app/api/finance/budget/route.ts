import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/config";

interface Budget {
  userId: ObjectId;
  month: number;
  year: number;
  totalBudget: number;
  allocations: {
    category: string;
    amount: number;
  }[];
  unallocated: number;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORY_MAPPING = {
  food: "Food & Dining",
  shopping: "Shopping",
  housing: "Housing",
  transportation: "Transportation",
  entertainment: "Entertainment",
  utilities: "Utilities",
  income: "Income",
} as const;

const VALID_CATEGORIES = Object.keys(CATEGORY_MAPPING);

const REVERSE_CATEGORY_MAPPING = Object.entries(CATEGORY_MAPPING).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value]: key,
  }),
  {} as {
    [K in (typeof CATEGORY_MAPPING)[keyof typeof CATEGORY_MAPPING]]: keyof typeof CATEGORY_MAPPING;
  }
);

// Get budget for a specific month and year
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(
      searchParams.get("month") || new Date().getMonth() + 1 + ""
    );
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear() + ""
    );

    // Validate month and year
    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const budgetsCollection = db.collection<Budget>("budgets");

    const budget = await budgetsCollection.findOne({
      userId: new ObjectId(session.user.id),
      month,
      year,
    });

    if (!budget) {
      return NextResponse.json({
        month,
        year,
        totalBudget: 0,
        allocations: [],
        unallocated: 0,
      });
    }

    // Transform categories to display names in the response
    const transformedBudget = {
      ...budget,
      allocations: budget.allocations.map((allocation) => ({
        ...allocation,
        category:
          CATEGORY_MAPPING[
            allocation.category as keyof typeof CATEGORY_MAPPING
          ] || allocation.category,
      })),
    };

    return NextResponse.json(transformedBudget);
  } catch (error) {
    console.error("Budget GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Create or update budget
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { month, year, totalBudget, allocations } = body;

    // Validate required fields
    if (!month || !year || !totalBudget || !allocations) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate month and year
    if (typeof month !== "number" || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid month" }, { status: 400 });
    }
    if (typeof year !== "number" || year < 2000 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    // Validate totalBudget
    if (typeof totalBudget !== "number" || totalBudget < 0) {
      return NextResponse.json(
        { error: "Invalid total budget amount" },
        { status: 400 }
      );
    }

    // Validate allocations
    if (!Array.isArray(allocations)) {
      return NextResponse.json(
        { error: "Allocations must be an array" },
        { status: 400 }
      );
    }

    // Transform display names back to internal format and validate
    const transformedAllocations = allocations.map((allocation) => ({
      ...allocation,
      category:
        REVERSE_CATEGORY_MAPPING[
          allocation.category as (typeof CATEGORY_MAPPING)[keyof typeof CATEGORY_MAPPING]
        ] || allocation.category,
    }));

    // Validate each allocation
    for (const allocation of transformedAllocations) {
      if (!allocation.category || !allocation.amount) {
        return NextResponse.json(
          { error: "Invalid allocation format" },
          { status: 400 }
        );
      }
      if (!VALID_CATEGORIES.includes(allocation.category)) {
        return NextResponse.json(
          { error: `Invalid category: ${allocation.category}` },
          { status: 400 }
        );
      }
      if (typeof allocation.amount !== "number" || allocation.amount < 0) {
        return NextResponse.json(
          { error: "Invalid allocation amount" },
          { status: 400 }
        );
      }
    }

    const totalAllocated = transformedAllocations.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (totalAllocated > totalBudget) {
      return NextResponse.json(
        { error: "Total allocated amount exceeds total budget" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const budgetsCollection = db.collection<Budget>("budgets");

    const result = await budgetsCollection.findOneAndUpdate(
      {
        userId: new ObjectId(session.user.id),
        month,
        year,
      },
      {
        $set: {
          totalBudget,
          allocations: transformedAllocations,
          unallocated: totalBudget - totalAllocated,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: new ObjectId(session.user.id),
          month,
          year,
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update budget" },
        { status: 500 }
      );
    }

    // Transform categories to display names in the response
    const transformedResult = {
      ...result,
      allocations: result.allocations.map((allocation) => ({
        ...allocation,
        category:
          CATEGORY_MAPPING[
            allocation.category as keyof typeof CATEGORY_MAPPING
          ] || allocation.category,
      })),
    };

    return NextResponse.json({
      success: true,
      budget: transformedResult,
    });
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
