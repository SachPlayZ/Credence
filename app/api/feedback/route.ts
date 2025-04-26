import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/config";

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
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      submittedAt: new Date().toISOString(),
    };

    // Here you would typically save the feedback to your database
    // For now, we'll just log it to the console
    console.log("Received feedback:", enrichedFeedbackData);

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
