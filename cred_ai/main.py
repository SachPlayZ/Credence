from input_handler import collect_user_data
from analyzer import analyze_budget_vs_expenses
from gemini_client import generate_gemini_report

def main():
    user_data = collect_user_data()
    analysis = analyze_budget_vs_expenses(user_data)
    report = generate_gemini_report(analysis)
    print("\n🧾 AI-Powered Financial Report:\n")
    print(report)

if __name__ == "__main__":
    main()
