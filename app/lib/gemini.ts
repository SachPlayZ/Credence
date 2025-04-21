import { GoogleGenerativeAI } from "@google/generative-ai";
import { BudgetAnalysis, FinancialReport } from "../types/ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateFinancialReport(
  analysis: BudgetAnalysis
): Promise<FinancialReport> {
  const categories = analysis.details
    .map(
      (d) =>
        `- ${d.category}: Spent ₹${d.spent}, Budget ₹${d.budget} → ${
          d.status
        } by ₹${Math.abs(d.difference)}`
    )
    .join("\n");

  const prompt = `
You are a financial advisor AI.

User's Income: ₹${analysis.income}
Total Budget: ₹${analysis.total_budget}
Total Spending: ₹${analysis.total_spent}
Overall Status: ${analysis.status}

Category Breakdown:
${categories}

Based on the data above, generate:
1. A summary of the user's financial behavior.
2. Highlight any overspending categories and how much over they went.
3. Give actionable advice to save or budget more efficiently.
4. Offer general financial health tips suitable to this scenario.
5. All monetary values should be presented in Indian Rupees (₹).
6. Include advice specific to the Indian market and economy when relevant.
7. Use a friendly and encouraging tone.
8. Output should be in json format, with the following keys:
summary: A brief summary of the user's financial behavior.
overspending_categories: A list of categories where overspending occurred, including the amount overspent.
category: The name of the category.
overspent_by: The amount overspent in Indian Rupees.
actionable_advice: A list of specific advice to save or budget more efficiently.
general_tips: General financial health tips suitable for the user's scenario.
9. Ensure the JSON is well-structured and valid.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as FinancialReport;
  } catch (error) {
    console.error("Failed to generate report:", error);
    throw new Error("Failed to generate financial report");
  }
}
