import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_gemini_report(analysis: dict) -> str:
    # Convert the categories to use Pound symbol
    categories = "\n".join([
        f"- {d['category']}: Spent £{d['spent']}, Budget £{d['budget']} → {d['status']} by £{abs(d['difference'])}"
        for d in analysis['details']
    ])

    prompt = f"""
You are a financial advisor AI.

User's Income: £{analysis['income']}
Total Budget: £{analysis['total_budget']}
Total Spending: £{analysis['total_spent']}
Overall Status: {analysis['status']}

Category Breakdown:
{categories}

Based on the data above, generate:
1. A summary of the user's financial behavior.
2. Highlight any overspending categories and how much over they went.
3. Give actionable advice to save or budget more efficiently.
4. Offer general financial health tips suitable to this scenario.
5. All monetary values should be presented in British Pounds (£).
6. Include advice specific to the UK market and economy when relevant.
"""

    try:
        # Use Groq's API with Llama 3 model instead of Gemini
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a financial advisor AI that provides insights and recommendations based on user's financial data."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract the response text
        return completion.choices[0].message.content
    except Exception as e:
        return f"Failed to generate report: {e}"