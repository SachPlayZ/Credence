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
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Failed to generate report: {e}"