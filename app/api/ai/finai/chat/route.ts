import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/config";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface ChatMessage {
  userId: ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

// Get chat history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const chatCollection = db.collection<ChatMessage>("chat_messages");

    const messages = await chatCollection
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Send message and get response
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    const client = await clientPromise;
    const db = client.db("credence");
    const chatCollection = db.collection<ChatMessage>("chat_messages");

    // Store user message
    await chatCollection.insertOne({
      userId: new ObjectId(session.user.id),
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    // Fetch user's financial data
    const transactionsCollection = db.collection("transactions");
    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    const budgetsCollection = db.collection("budgets");
    const budgets = await budgetsCollection
      .find({ userId: new ObjectId(session.user.id) })
      .toArray();

    // Create context from financial data
    const context = {
      transactions: transactions.map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description,
      })),
      budgets: budgets.map((b) => ({
        amount: b.amount,
        category: b.category,
        period: b.period,
      })),
    };

    const prompt = `You are a financial assistant with access to the user's financial data. 
    Here is the context of their financial information:
    ${JSON.stringify(context, null, 2)}
    
    User's question: ${message}
    
    Please provide a brief and concise response based on their financial data. Keep your answers short and to the point.
    Focus on providing actionable advice and insights in 2-3 sentences maximum.
    Use a friendly and encouraging tone.
    All monetary values should be presented in Indian Rupees (₹).
    Include advice specific to the Indian market and economy when relevant.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content:
            "You are a financial advisor AI that provides concise insights and recommendations based on user's financial data. Keep responses brief and focused.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I apologize, but I couldn't generate a response at this time.";

    // Store assistant's response
    await chatCollection.insertOne({
      userId: new ObjectId(session.user.id),
      role: "assistant",
      content: response,
      createdAt: new Date(),
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Clear chat history
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const chatCollection = db.collection<ChatMessage>("chat_messages");

    await chatCollection.deleteMany({
      userId: new ObjectId(session.user.id),
    });

    return NextResponse.json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
