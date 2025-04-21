import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/config";
import { analyzeBudgetVsExpenses } from "@/app/lib/analyzer";
import { generateFinancialReport } from "@/app/lib/gemini";
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

    // Analyze budget vs expenses
    const analysis = analyzeBudgetVsExpenses(data);

    // Generate AI report
    const report = await generateFinancialReport(analysis);

    return NextResponse.json({
      analysis,
      report,
    });
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
