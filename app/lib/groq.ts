/**
 * Financial Report Generator using Groq AI
 * 
 * This module interfaces with the Groq AI API to generate personalized
 * financial reports based on budget analysis data.
 */
import Groq from "groq-sdk";
import { BudgetAnalysis, FinancialReport } from "../types/ai";

// Initialize Groq client with API key from environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/**
 * Cleans and formats the JSON response from the AI
 * 
 * @param text - Raw text response from Groq API
 * @returns Cleaned JSON string ready for parsing
 */
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

/**
 * Extracts the first name from a full name string
 * 
 * @param fullName - User's full name
 * @returns First name only
 */
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

/**
 * Generates a comprehensive financial report using Groq AI
 * 
 * @param analysis - Budget analysis data with income, expenses, and budget details
 * @returns Structured financial report with insights and recommendations
 */
export async function generateFinancialReport(
  analysis: BudgetAnalysis
): Promise<FinancialReport> {
  // Ensure analysis.details exists with a default empty array
  const details = analysis?.details || [];
  
  // Get user's first name or default to "there"
  const fullName = analysis?.userName || "there";
  const firstName = getFirstName(fullName);

  // Format category details for the prompt
  const categories = details
    .map(
      (d) =>
        `- ${d.category}: Spent ₹${d.spent}, Budget ₹${d.budget} → ${
          d.status
        } by ₹${Math.abs(d.difference)}`
    )
    .join("\n");

  // Construct a detailed prompt for the AI model
  const prompt = `
You are a financial advisor AI.

Hello ${firstName},

Here's an analysis of your financial data:

Your Income: ₹${analysis?.income || 0}
Total Budget: ₹${analysis?.total_budget || 0}
Total Spending: ₹${analysis?.total_spent || 0}
Overall Status: ${analysis?.status || "under"}

Category Breakdown:
${categories}

Based on the data above, generate:
1. A summary of ${firstName}'s financial behavior.
2. Key insights about spending patterns and budget adherence.
3. Specific recommendations with priority levels.
4. Highlight any overspending categories and how much over they went.
5. Give actionable advice to save or budget more efficiently.
6. Offer general financial health tips suitable to this scenario.
7. All monetary values should be presented in Indian Rupees (₹).
8. Include advice specific to the Indian market and economy when relevant.
9. Use a friendly and encouraging tone, addressing ${firstName} by first name only.
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
14. Address the user as ${firstName} in the generated output text, not as "[user]" or the full name.
`;

  try {
    // Call Groq API with Llama 3 model 
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",  // Using Llama 3 70B model (similar to Gemini's capabilities)
      messages: [
        {
          role: "system",
          content: "You are a financial advisor AI that provides insights and recommendations based on user's financial data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,         // Controls creativity vs consistency
      max_tokens: 1500,         // Limits response length
      response_format: { type: "json_object" }  // Ensures JSON formatted response
    });

    // Extract and clean the AI response
    const text = completion.choices[0]?.message?.content || "{}";
    const cleanedText = cleanJsonResponse(text);
    console.log(cleanedText);
    return JSON.parse(cleanedText) as FinancialReport;
  } catch (error) {
    // Error handling and logging
    console.error("Failed to generate report with Groq:", error);
    throw new Error("Failed to generate financial report");
  }
}