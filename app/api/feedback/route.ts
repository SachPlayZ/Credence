import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/config";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to submit feedback" },
        { status: 401 }
      );
    }

    // Get the feedback data from the request body
    const feedbackData = await request.json();

    // Add user information to the feedback data
    const enrichedFeedbackData = {
      ...feedbackData,
      userId: new ObjectId(session.user.id),
      userEmail: session.user.email,
      userName: session.user.name,
      userImage: session.user.image,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("credence");
    const feedbackCollection = db.collection("feedback");

    await feedbackCollection.insertOne(enrichedFeedbackData);

    return NextResponse.json(
      { message: "Feedback submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}

// Check if user has submitted feedback
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to check feedback status" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("credence");
    const feedbackCollection = db.collection("feedback");

    // Check if user has submitted feedback
    const existingFeedback = await feedbackCollection.findOne({
      userId: new ObjectId(session.user.id),
    });

    return NextResponse.json({ hasSubmitted: !!existingFeedback });
  } catch (error) {
    console.error("Error checking feedback status:", error);
    return NextResponse.json(
      { error: "Failed to check feedback status" },
      { status: 500 }
    );
  }
}
