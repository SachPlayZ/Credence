// This API endpoint provides AI-powered financial analysis based on user's budget data
// It verifies authentication, analyzes budget vs expenses, and generates personalized insights
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/config";
import { analyzeBudgetVsExpenses } from "@/app/lib/analyzer";
import { generateFinancialReport } from "@/app/lib/groq"; // Using Groq now
import { BudgetAnalysisInput } from "@/app/types/ai";

export async function POST(req: Request) {
  try {
    // Authentication: Retrieve user session and verify they're logged in
    const session = await getServerSession(authOptions);

    console.log("AI Analysis API - Session:", {
      exists: !!session,
      userId: session?.user?.id,
    });

    // Return 401 if user is not authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and type-cast the incoming request body
    const data = (await req.json()) as BudgetAnalysisInput;

    // Validate input: Ensure all required financial data is provided
    if (!data.income || !data.expenses || !data.budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log which AI model is being used for transparency and debugging
    console.log("AI Provider: Groq (llama3-70b-8192)");

    // Step 1: Perform programmatic analysis of financial data
    const analysis = analyzeBudgetVsExpenses(data);
    
    // Step 2: Personalize the analysis with user's name
    // Try to use full name, then email username, or default to "there"
    analysis.userName = session?.user?.name || session?.user?.email?.split('@')[0] || "there";

    // Step 3: Generate AI-powered financial insights and recommendations
    console.log("Generating financial report with Groq...");
    const startTime = Date.now();
    const report = await generateFinancialReport(analysis);
    const endTime = Date.now();
    console.log(`Report generated in ${endTime - startTime}ms`);

    // Return successful response with:
    // - Raw financial analysis data
    // - AI-generated report text
    // - Metadata about the model used and processing time
    return NextResponse.json({
      analysis,
      report,
      meta: {
        provider: "groq",
        model: "llama3-70b-8192",
        responseTime: endTime - startTime
      }
    });
  } catch (error) {
    // Handle any errors that occur during processing
    // Log the full error for debugging but only return a generic message to the client
    console.error("AI Analysis error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
