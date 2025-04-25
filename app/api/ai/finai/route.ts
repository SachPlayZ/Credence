/**
 * FinAI API Route
 * 
 * This API endpoint provides financial analysis including:
 * - Budget vs expenses breakdown by category
 * - AI-generated financial reports and insights
 * - Month-to-date spending analysis
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/config";
import { generateFinancialReport } from "@/app/lib/groq"; // Changed from gemini to groq
import { analyzeBudgetVsExpenses } from "@/app/lib/analyzer";

export async function GET(req: Request) {
  try {
    // Authentication - ensure user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(req);
    
    // Determine current time period for analysis
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("credence");

    // STEP 1: Fetch user's current budget
    const budgetsCollection = db.collection("budgets");
    const currentBudget = await budgetsCollection.findOne({
      userId: new ObjectId(session.user.id),
      month: currentMonth,
      year: currentYear,
    });

    // Return early if no budget exists for current month
    if (!currentBudget) {
      return NextResponse.json(
        {
          error: "No budget found for current month",
        },
        { status: 404 }
      );
    }

    // STEP 2: Fetch user's transactions for expense analysis
    const transactionsCollection = db.collection("transactions");
    const startOfMonth = new Date(currentYear, now.getMonth(), 1);

    // MongoDB aggregation to calculate spending by category
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
            spent: { $sum: "$amount" },           // Total spent in this category
            transactions: { $sum: 1 },            // Count of transactions
            lastTransaction: { $max: "$date" },   // Most recent transaction date
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

    // STEP 3: Format budget data for analysis
    // Convert budget allocations array to a map for easier lookup
    const budgetAllocations = currentBudget.allocations.reduce(
      (acc: { [key: string]: number }, allocation: any) => {
        acc[allocation.category] = allocation.amount;
        return acc;
      },
      {}
    );

    // STEP 4: Create detailed breakdown comparing budget vs actual spending
    const breakdown = Object.entries(
      budgetAllocations as { [key: string]: number }
    ).map(([category, budgeted]) => {
      // Find actual expenses for this category, default to 0 if none found
      const expense = categoryExpenses.find((e) => e.category === category) || {
        spent: 0,
        transactions: 0,
        lastTransaction: null,
      };

      const spent = expense.spent;
      const remaining = Math.max(budgeted - spent, 0);
      const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;

      // Return detailed object with spending status for this category
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
            ? "exceeded"              // Over budget
            : percentageUsed >= 80
            ? "warning"               // Approaching budget limit
            : "good",                 // Healthy spending
      };
    });

    // STEP 5: Calculate overall budget totals
    const totals = {
      budgeted: currentBudget.totalBudget,
      spent: breakdown.reduce((sum, item) => sum + item.spent, 0),
      remaining:
        currentBudget.totalBudget - breakdown.reduce((sum, item) => sum + item.spent, 0),
    };

    // STEP 6: Prepare data for AI analysis
    // Format data in structure expected by the analyzer
    const analysisInput = {
      income: currentBudget.totalBudget,
      budget: budgetAllocations,
      expenses: categoryExpenses.reduce(
        (acc: { [key: string]: number }, curr) => {
          acc[curr.category] = curr.spent;
          return acc;
        },
        // Initialize all budget categories with 0 to handle categories with no spending
        Object.keys(budgetAllocations).reduce(
          (acc: { [key: string]: number }, category) => {
            acc[category] = 0;
            return acc;
          },
          {}
        )
      ),
    };

    // STEP 7: Generate AI analysis and personalized financial report
    // Analyze budget vs expenses data
    const analysis = analyzeBudgetVsExpenses(analysisInput);
    
    // Personalize the analysis with user's name
    analysis.userName = session?.user?.name || session?.user?.email?.split('@')[0] || "there";
    
    // Generate natural language financial report using Groq AI
    const aiReport = await generateFinancialReport(analysis);

    // STEP 8: Combine all data into final response structure
    const response = {
      categoryBreakdown: {
        breakdown,          // Detailed category-by-category analysis
        totals,             // Summary totals (budget, spent, remaining)
        month: currentMonth,
        year: currentYear,
      },
      aiAnalysis: {
        analysis,           // Structured analysis data
        report: aiReport,   // Natural language report from AI
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    // Error handling
    console.error("FinAI Analysis error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
