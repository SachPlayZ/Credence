import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/config";
import { cookies } from "next/headers";
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

    // Connect to MongoDB and save the feedback
    const client = await clientPromise;
    const db = client.db("credence");
    const feedbackCollection = db.collection("feedback");

    await feedbackCollection.insertOne(enrichedFeedbackData);

    // Create response with cookie
    const response = NextResponse.json(
      { message: "Feedback submitted successfully" },
      { status: 200 }
    );

    // Set cookie to mark feedback as submitted
    response.cookies.set("feedback_submitted", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    return response;
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to check if user has submitted feedback
export async function GET() {
  try {
    const cookieStore = await cookies();
    const hasFeedback = cookieStore.get("feedback_submitted")?.value === "true";
    return NextResponse.json({ hasSubmitted: hasFeedback });
  } catch (error) {
    console.error("Error checking feedback status:", error);
    return NextResponse.json(
      { error: "Failed to check feedback status" },
      { status: 500 }
    );
  }
}
