import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/config";
import { analyzeBudgetVsExpenses } from "@/app/lib/analyzer";
import { generateFinancialReport } from "@/app/lib/groq"; // Using Groq now
import { BudgetAnalysisInput } from "@/app/types/ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("AI Analysis API - Session:", {
      exists: !!session,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await req.json()) as BudgetAnalysisInput;

    // Validate input
    if (!data.income || !data.expenses || !data.budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log the AI provider being used
    console.log("AI Provider: Groq (llama3-70b-8192)");

    // Analyze budget vs expenses
    const analysis = analyzeBudgetVsExpenses(data);
    
    // Add user's name to the analysis
    analysis.userName = session?.user?.name || session?.user?.email?.split('@')[0] || "there";

    // Generate AI report
    console.log("Generating financial report with Groq...");
    const startTime = Date.now();
    const report = await generateFinancialReport(analysis);
    const endTime = Date.now();
    console.log(`Report generated in ${endTime - startTime}ms`);

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
    console.error("AI Analysis error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
