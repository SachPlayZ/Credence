import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/config";

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

    // Get the start date of 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate daily transactions
    const dailyTransactions = await transactionsCollection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(session.user.id),
            date: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            transactions: {
              $push: {
                type: "$_id.type",
                amount: "$total",
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Calculate running balance
    let runningBalance = 0;
    const balanceTrend = dailyTransactions.map((day) => {
      let dailyNet = 0;
      day.transactions.forEach((t: { type: string; amount: number }) => {
        if (t.type === "income") {
          dailyNet += t.amount;
        } else if (t.type === "expense") {
          dailyNet -= t.amount;
        }
      });
      runningBalance += dailyNet;

      return {
        date: day._id,
        balance: runningBalance,
      };
    });

    return NextResponse.json(balanceTrend);
  } catch (error) {
    console.error("Error fetching balance trend:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
