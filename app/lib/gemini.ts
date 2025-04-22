import { GoogleGenerativeAI } from "@google/generative-ai";
import { BudgetAnalysis, FinancialReport } from "../types/ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  text = text
    .replace(/```json\n/g, "")
    .replace(/```\n/g, "")
    .replace(/```/g, "");

  // Remove any leading/trailing whitespace
  text = text.trim();

  // If the text starts with a newline, remove it
  text = text.replace(/^\n+/, "");

  return text;
}

export async function generateFinancialReport(
  analysis: BudgetAnalysis
): Promise<FinancialReport> {
  // Ensure analysis.details exists with a default empty array
  const details = analysis?.details || [];

  const categories = details
    .map(
      (d) =>
        `- ${d.category}: Spent ₹${d.spent}, Budget ₹${d.budget} → ${
          d.status
        } by ₹${Math.abs(d.difference)}`
    )
    .join("\n");

  const prompt = `
You are a financial advisor AI.

User's Income: ₹${analysis?.income || 0}
Total Budget: ₹${analysis?.total_budget || 0}
Total Spending: ₹${analysis?.total_spent || 0}
Overall Status: ${analysis?.status || "under"}

Category Breakdown:
${categories}

Based on the data above, generate:
1. A summary of the user's financial behavior.
2. Key insights about spending patterns and budget adherence.
3. Specific recommendations with priority levels.
4. Highlight any overspending categories and how much over they went.
5. Give actionable advice to save or budget more efficiently.
6. Offer general financial health tips suitable to this scenario.
7. All monetary values should be presented in Indian Rupees (₹).
8. Include advice specific to the Indian market and economy when relevant.
9. Use a friendly and encouraging tone.
10. Output should be in json format, with the following keys:
{
  "summary": "A brief summary of the user's financial behavior",
  "insights": [
    {
      "title": "Brief insight title",
      "description": "Detailed description of the insight",
      "type": "positive" | "warning" | "negative"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "priority": "high" | "medium" | "low"
    }
  ],
  "overspending_categories": [
    {
      "category": "Category name",
      "overspent_by": "Amount in Rupees"
    }
  ],
  "actionable_advice": ["List of specific advice"],
  "general_tips": ["List of financial tips"]
}
11. Ensure the JSON is well-structured and valid.
12. DO NOT wrap the JSON in markdown code blocks or any other formatting.
13. Make sure recommendations are specific and actionable, with appropriate priority levels based on their impact and urgency.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the JSON response
    const cleanedText = cleanJsonResponse(text);
    console.log(cleanedText);
    return JSON.parse(cleanedText) as FinancialReport;
  } catch (error) {
    console.error("Failed to generate report:", error);
    throw new Error("Failed to generate financial report");
  }
}
