import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../../auth/config";

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
    const budgetsCollection = db.collection("budgets");

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, now.getMonth(), 1);

    // Get current month's budget
    const currentBudget = await budgetsCollection.findOne({
      userId: new ObjectId(session.user.id),
      month: currentMonth,
      year: currentYear,
    });

    // Aggregate expenses by category
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
            spent: { $sum: "$amount" },
            transactions: { $sum: 1 },
            lastTransaction: { $max: "$date" },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            spent: 1,
            transactions: 1,
            lastTransaction: 1,
          },
        },
      ])
      .toArray();

    // Create a map of budget allocations
    const budgetAllocations =
      currentBudget?.allocations.reduce(
        (acc: { [key: string]: number }, allocation: any) => {
          acc[allocation.category] = allocation.amount;
          return acc;
        },
        {}
      ) || {};

    // Combine expenses with budget data and calculate percentages
    const breakdown = Object.entries(CATEGORY_MAPPING).map(
      ([key, displayName]) => {
        const expense = categoryExpenses.find((e) => e.category === key) || {
          spent: 0,
          transactions: 0,
          lastTransaction: null,
        };
        const budgeted = budgetAllocations[key] || 0;
        const spent = expense.spent;
        const remaining = Math.max(budgeted - spent, 0);
        const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;

        return {
          category: displayName,
          budgeted,
          spent,
          remaining,
          percentageUsed,
          transactions: expense.transactions,
          lastTransaction: expense.lastTransaction,
          status:
            percentageUsed >= 100
              ? "exceeded"
              : percentageUsed >= 80
              ? "warning"
              : "good",
        };
      }
    );

    // Sort by percentage used (descending)
    breakdown.sort((a, b) => b.percentageUsed - a.percentageUsed);

    // Calculate totals
    const totals = {
      budgeted: breakdown.reduce((sum, item) => sum + item.budgeted, 0),
      spent: breakdown.reduce((sum, item) => sum + item.spent, 0),
      remaining: breakdown.reduce((sum, item) => sum + item.remaining, 0),
    };

    return NextResponse.json({
      breakdown,
      totals,
      month: currentMonth,
      year: currentYear,
    });
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
