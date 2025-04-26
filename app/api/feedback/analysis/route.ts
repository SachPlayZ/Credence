import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/config";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to view feedback analysis" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("credence");
    const feedbackCollection = db.collection("feedback");

    // Get all feedback data
    const feedbackData = await feedbackCollection.find({}).toArray();

    // Calculate overall statistics
    const totalResponses = feedbackData.length;

    // Rating averages
    const ratingMetrics = [
      "easeOfLogging",
      "budgetEffectiveness",
      "reminderSatisfaction",
      "recommendationLikelihood",
    ];
    const ratingAverages = ratingMetrics.reduce((acc, metric) => {
      const sum = feedbackData.reduce(
        (total, feedback) => total + (feedback[metric] || 0),
        0
      );
      acc[metric] = totalResponses
        ? Number((sum / totalResponses).toFixed(1))
        : 0;
      return acc;
    }, {} as Record<string, number>);

    // Feature usage analysis
    const featureUsage = feedbackData.reduce((acc, feedback) => {
      (feedback.mostUsedFeatures || []).forEach((feature: string) => {
        acc[feature] = (acc[feature] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Desired improvements analysis
    const desiredImprovements = feedbackData.reduce((acc, feedback) => {
      (feedback.desiredImprovements || []).forEach((improvement: string) => {
        acc[improvement] = (acc[improvement] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Usage frequency distribution
    const usageFrequency = feedbackData.reduce((acc, feedback) => {
      const frequency = feedback.usageFrequency || "unknown";
      acc[frequency] = (acc[frequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Discovery source distribution
    const discoverySource = feedbackData.reduce((acc, feedback) => {
      const source = feedback.discoverySource || "unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Prior budgeting skill distribution
    const priorBudgetingSkill = feedbackData.reduce((acc, feedback) => {
      const skill = feedback.priorBudgetingSkill || "unknown";
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get all feedback with user details
    const memberFeedback = await feedbackCollection
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json({
      totalResponses,
      ratingAverages,
      featureUsage,
      desiredImprovements,
      usageFrequency,
      discoverySource,
      priorBudgetingSkill,
      memberFeedback,
    });
  } catch (error) {
    console.error("Error fetching feedback analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback analysis" },
      { status: 500 }
    );
  }
}
