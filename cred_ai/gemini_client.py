import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_gemini_report(analysis: dict) -> str:
    # Convert the categories to use Rupee symbol
    categories = "\n".join([
        f"- {d['category']}: Spent ₹{d['spent']}, Budget ₹{d['budget']} → {d['status']} by ₹{abs(d['difference'])}"
        for d in analysis['details']
    ])

    prompt = f"""
You are a financial advisor AI.

User's Income: ₹{analysis['income']}
Total Budget: ₹{analysis['total_budget']}
Total Spending: ₹{analysis['total_spent']}
Overall Status: {analysis['status']}

Category Breakdown:
{categories}

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
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Failed to generate report: {e}"