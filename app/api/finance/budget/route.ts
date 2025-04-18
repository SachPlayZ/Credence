import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { GET as authHandler } from "../../auth/[...nextauth]/route";
import { Budget } from "@/app/types";
import type { Session } from "next-auth";

// Set monthly budget
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, year, amount, categories } = await req.json();
    const client = await clientPromise;
    const db = client.db("credence");
    const budgetsCollection = db.collection<Budget>("budgets");

    // Validate month and year
    if (typeof month !== "number" || typeof year !== "number") {
      return NextResponse.json(
        { error: "Month and year must be numbers" },
        { status: 400 }
      );
    }

    const result = await budgetsCollection.findOneAndUpdate(
      {
        userId: new ObjectId(session.user.id),
        month,
        year,
      },
      {
        $set: {
          userId: new ObjectId(session.user.id),
          month,
          year,
          amount,
          categories,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update budget" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Get monthly budget
export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(
      searchParams.get("month") || new Date().getMonth().toString()
    );
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    const client = await clientPromise;
    const db = client.db("credence");
    const budgetsCollection = db.collection<Budget>("budgets");

    const budget = await budgetsCollection.findOne({
      userId: new ObjectId(session.user.id),
      month,
      year,
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Budget GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
