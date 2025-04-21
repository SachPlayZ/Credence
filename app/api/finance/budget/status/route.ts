import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../../auth/config";
import type { Transaction } from "@/app/types";

const CATEGORY_MAPPING = {
  food: "Food & Dining",
  shopping: "Shopping",
  housing: "Housing",
  transportation: "Transportation",
  entertainment: "Entertainment",
  utilities: "Utilities",
  income: "Income",
} as const;

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
}

interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalPercentage: number;
  categories: BudgetStatus[];
}

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
    const transactionsCollection = db.collection<Transaction>("transactions");

    // Get budget for the month
    const budget = await budgetsCollection.findOne({
      userId: new ObjectId(session.user.id),
      month,
      year,
    });

    // Get all transactions for the month regardless of budget existence
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await transactionsCollection
      .find({
        userId: new ObjectId(session.user.id),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();

    // If no budget exists, return status with only actual spending
    if (!budget) {
      let totalSpent = 0;
      const spendingByCategory = new Map<string, number>();

      transactions.forEach((transaction) => {
        if (transaction.type === "expense") {
          totalSpent += transaction.amount;
          const displayCategory =
            CATEGORY_MAPPING[
              transaction.category as keyof typeof CATEGORY_MAPPING
            ] || transaction.category;
          const currentAmount = spendingByCategory.get(displayCategory) || 0;
          spendingByCategory.set(
            displayCategory,
            currentAmount + transaction.amount
          );
        }
      });

      const categories: BudgetStatus[] = Array.from(
        spendingByCategory.entries()
      ).map(([category, spent]) => ({
        category,
        budget: 0,
        spent,
        remaining: -spent,
        percentage: 100,
      }));

      const budgetOverview: BudgetOverview = {
        totalBudget: 0,
        totalSpent,
        totalRemaining: -totalSpent,
        totalPercentage: 100,
        categories,
      };

      return NextResponse.json(budgetOverview);
    }

    // Calculate spending by category
    const spendingByCategory = new Map<string, number>();
    let totalSpent = 0;

    // First, initialize all budget categories with 0 spent
    budget.allocations.forEach((allocation) => {
      const displayCategory =
        CATEGORY_MAPPING[
          allocation.category as keyof typeof CATEGORY_MAPPING
        ] || allocation.category;
      spendingByCategory.set(displayCategory, 0);
    });

    // Then calculate actual spending for each category
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const displayCategory =
          CATEGORY_MAPPING[
            transaction.category as keyof typeof CATEGORY_MAPPING
          ] || transaction.category;
        const currentAmount = spendingByCategory.get(displayCategory) || 0;
        spendingByCategory.set(
          displayCategory,
          currentAmount + transaction.amount
        );
        totalSpent += transaction.amount;
      }
    });

    // Calculate budget status for each category
    const categories: BudgetStatus[] = budget.allocations.map((allocation) => {
      const displayCategory =
        CATEGORY_MAPPING[
          allocation.category as keyof typeof CATEGORY_MAPPING
        ] || allocation.category;
      const spent = spendingByCategory.get(displayCategory) || 0;
      const remaining = allocation.amount - spent;
      const percentage =
        allocation.amount > 0 ? (spent / allocation.amount) * 100 : 100;

      return {
        category: displayCategory,
        budget: allocation.amount,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    // Add categories that have spending but no budget
    transactions.forEach((transaction) => {
      if (
        transaction.type === "expense" &&
        !budget.allocations.some((a) => {
          const displayCategory =
            CATEGORY_MAPPING[a.category as keyof typeof CATEGORY_MAPPING] ||
            a.category;
          const transDisplayCategory =
            CATEGORY_MAPPING[
              transaction.category as keyof typeof CATEGORY_MAPPING
            ] || transaction.category;
          return displayCategory === transDisplayCategory;
        })
      ) {
        const displayCategory =
          CATEGORY_MAPPING[
            transaction.category as keyof typeof CATEGORY_MAPPING
          ] || transaction.category;
        const spent = spendingByCategory.get(displayCategory) || 0;
        categories.push({
          category: displayCategory,
          budget: 0,
          spent,
          remaining: -spent,
          percentage: 100,
        });
      }
    });

    // Calculate overall budget status
    const totalRemaining = budget.totalBudget - totalSpent;
    const totalPercentage =
      budget.totalBudget > 0
        ? Math.round((totalSpent / budget.totalBudget) * 10000) / 100
        : 100;

    const budgetOverview: BudgetOverview = {
      totalBudget: budget.totalBudget,
      totalSpent,
      totalRemaining,
      totalPercentage,
      categories,
    };

    return NextResponse.json(budgetOverview);
  } catch (error) {
    console.error("Budget status GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
