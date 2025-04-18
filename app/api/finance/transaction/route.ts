import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId, ModifyResult } from "mongodb";
import { GET as authHandler } from "../../auth/[...nextauth]/route";
import { Transaction, Balance } from "@/app/types";
import type { Session } from "next-auth";

// Helper function to update balance
async function updateBalance(
  userId: string,
  amount: number,
  type: "income" | "expense"
) {
  const client = await clientPromise;
  const db = client.db("credence");
  const balancesCollection = db.collection<Balance>("balances");

  const balance = await balancesCollection.findOne({
    userId: new ObjectId(userId),
  });

  if (!balance) {
    await balancesCollection.insertOne({
      userId: new ObjectId(userId),
      currentBalance: type === "income" ? amount : -amount,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await balancesCollection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $inc: { currentBalance: type === "income" ? amount : -amount },
        $set: { lastUpdated: new Date(), updatedAt: new Date() },
      }
    );
  }
}

// Add new transaction
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, amount, category, description } = await req.json();
    const client = await clientPromise;
    const db = client.db("credence");
    const transactionsCollection = db.collection<Transaction>("transactions");

    const transaction = await transactionsCollection.insertOne({
      userId: new ObjectId(session.user.id),
      type,
      amount,
      category,
      description,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update balance
    await updateBalance(session.user.id, amount, type);

    return NextResponse.json({
      _id: transaction.insertedId,
      userId: new ObjectId(session.user.id),
      type,
      amount,
      category,
      description,
      date: new Date(),
    });
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Get all transactions
export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    const client = await clientPromise;
    const db = client.db("credence");
    const transactionsCollection = db.collection<Transaction>("transactions");

    let query: any = { userId: new ObjectId(session.user.id) };
    if (category) query.category = category;
    if (type) query.type = type;

    const transactions = await transactionsCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update transaction
export async function PUT(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type, amount, category, description } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const transactionsCollection = db.collection<Transaction>("transactions");

    const oldTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (!oldTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Reverse the old transaction's effect on balance
    await updateBalance(
      session.user.id,
      oldTransaction.amount,
      oldTransaction.type === "income" ? "expense" : "income"
    );

    // Update the transaction
    const updatedTransaction = await transactionsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          type,
          amount,
          category,
          description,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    // Update balance with new values
    await updateBalance(session.user.id, amount, type);

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("Transaction PUT error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete transaction
export async function DELETE(req: Request) {
  try {
    const session = (await getServerSession(authHandler)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const transactionsCollection = db.collection<Transaction>("transactions");

    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Reverse the transaction's effect on balance
    await updateBalance(
      session.user.id,
      transaction.amount,
      transaction.type === "income" ? "expense" : "income"
    );

    await transactionsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
