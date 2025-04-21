import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../../auth/config";

// Define the mapping from internal category keys to display names
const CATEGORY_MAPPING = {
  food: "Food & Dining",
  shopping: "Shopping",
  housing: "Housing",
  transportation: "Transportation",
  entertainment: "Entertainment",
  utilities: "Utilities",
  other: "Other",
} as const;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(req);
    const client = await clientPromise;
    const db = client.db("credence");
    const transactionsCollection = db.collection("transactions");

    // Get the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Aggregate transactions by category
    const categoryExpenses = await transactionsCollection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(session.user.id),
            type: "expense",
            date: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: "$category",
            value: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            name: {
              $switch: {
                branches: Object.entries(CATEGORY_MAPPING).map(
                  ([key, value]) => ({
                    case: key,
                    then: value,
                  })
                ),
                default: "Other",
              },
            },
            value: 1,
          },
        },
        {
          $match: {
            value: { $gt: 0 }, // Only include categories with expenses
          },
        },
        {
          $sort: { value: -1 },
        },
      ])
      .toArray();

    // Calculate total expenses
    const total = categoryExpenses.reduce((sum, item) => sum + item.value, 0);

    // Add percentage to each category
    const categoriesWithPercentage = categoryExpenses.map((item) => ({
      ...item,
      percentage:
        total > 0 ? ((item.value / total) * 100).toFixed(1) + "%" : "0%",
    }));

    return NextResponse.json({
      categoryExpenses: categoriesWithPercentage,
      total,
    });
  } catch (error) {
    console.error("Error fetching category expenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
