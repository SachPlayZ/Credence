import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/config";
import { generateFinancialReport } from "@/app/lib/gemini";
import { analyzeBudgetVsExpenses } from "@/app/lib/analyzer";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(req);
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const client = await clientPromise;
    const db = client.db("credence");

    // Fetch budget data
    const budgetsCollection = db.collection("budgets");
    const currentBudget = await budgetsCollection.findOne({
      userId: new ObjectId(session.user.id),
      month: currentMonth,
      year: currentYear,
    });

    if (!currentBudget) {
      return NextResponse.json(
        {
          error: "No budget found for current month",
        },
        { status: 404 }
      );
    }

    // Fetch transactions for expense breakdown
    const transactionsCollection = db.collection("transactions");
    const startOfMonth = new Date(currentYear, now.getMonth(), 1);

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

    // Create budget allocations map
    const budgetAllocations = currentBudget.allocations.reduce(
      (acc: { [key: string]: number }, allocation: any) => {
        acc[allocation.category] = allocation.amount;
        return acc;
      },
      {}
    );

    // Combine expenses with budget data
    const breakdown = Object.entries(
      budgetAllocations as { [key: string]: number }
    ).map(([category, budgeted]) => {
      const expense = categoryExpenses.find((e) => e.category === category) || {
        spent: 0,
        transactions: 0,
        lastTransaction: null,
      };

      const spent = expense.spent;
      const remaining = Math.max(budgeted - spent, 0);
      const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;

      return {
        category,
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
    });

    // Calculate totals
    const totals = {
      budgeted: currentBudget.totalBudget,
      spent: breakdown.reduce((sum, item) => sum + item.spent, 0),
      remaining:
        currentBudget.totalBudget -
        breakdown.reduce((sum, item) => sum + item.spent, 0),
    };

    // Prepare data for AI analysis
    const analysisInput = {
      income: currentBudget.totalBudget,
      budget: budgetAllocations,
      expenses: categoryExpenses.reduce(
        (acc: { [key: string]: number }, curr) => {
          acc[curr.category] = curr.spent;
          return acc;
        },
        Object.keys(budgetAllocations).reduce(
          (acc: { [key: string]: number }, category) => {
            acc[category] = 0; // Initialize all budget categories with 0 spent
            return acc;
          },
          {}
        )
      ),
    };

    // Get AI analysis
    const analysis = analyzeBudgetVsExpenses(analysisInput);
    const aiReport = await generateFinancialReport(analysis);

    // Combine all data
    const response = {
      categoryBreakdown: {
        breakdown,
        totals,
        month: currentMonth,
        year: currentYear,
      },
      aiAnalysis: {
        analysis,
        report: aiReport,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("FinAI Analysis error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
