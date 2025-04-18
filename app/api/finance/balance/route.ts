import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { GET as authHandler } from "../../auth/[...nextauth]/route";
import { Transaction, Balance } from "@/app/types";
import type { Session } from "next-auth";

// Get user's balance and spending summary
export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("credence");

    // Get current balance
    const balancesCollection = db.collection<Balance>("balances");
    let balance = await balancesCollection.findOne({
      userId: new ObjectId(session.user.id),
    });

    if (!balance) {
      const result = await balancesCollection.insertOne({
        userId: new ObjectId(session.user.id),
        currentBalance: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      balance = {
        _id: result.insertedId,
        userId: new ObjectId(session.user.id),
        currentBalance: 0,
        lastUpdated: new Date(),
      };
    }

    // Get spending summary for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactionsCollection = db.collection<Transaction>("transactions");
    const monthlyTransactions = await transactionsCollection
      .find({
        userId: new ObjectId(session.user.id),
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .toArray();

    // Calculate spending by category
    const spendingByCategory = monthlyTransactions.reduce(
      (acc: Record<string, number>, transaction) => {
        if (transaction.type === "expense") {
          acc[transaction.category] =
            (acc[transaction.category] || 0) + transaction.amount;
        }
        return acc;
      },
      {}
    );

    // Calculate total income and expenses for the month
    const monthlyStats = monthlyTransactions.reduce(
      (acc: { totalIncome: number; totalExpenses: number }, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    return NextResponse.json({
      currentBalance: balance.currentBalance,
      monthlyStats,
      spendingByCategory,
    });
  } catch (error) {
    console.error("Balance GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
