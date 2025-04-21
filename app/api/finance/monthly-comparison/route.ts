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

    // Get the start date of 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Aggregate monthly income and expenses
    const monthlyData = await transactionsCollection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(session.user.id),
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: "$_id.month",
            },
            data: {
              $push: {
                type: "$_id.type",
                amount: "$total",
              },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ])
      .toArray();

    // Transform the data into the required format
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedData = monthlyData.map((item) => {
      const monthData = {
        name: monthNames[item._id.month - 1],
        income: 0,
        expenses: 0,
      };

      item.data.forEach((d: { type: string; amount: number }) => {
        if (d.type === "income") {
          monthData.income = d.amount;
        } else if (d.type === "expense") {
          monthData.expenses = d.amount;
        }
      });

      return monthData;
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly comparison:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
