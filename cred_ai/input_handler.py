def collect_user_data():
    income = float(input("Enter your monthly income: "))
    num_categories = int(input("How many expense categories do you want to enter? "))
    
    expenses = {}
    budget = {}

    print("\n--- Enter Actual Spendings ---")
    for _ in range(num_categories):
        category = input("Category name: ")
        spent = float(input(f"Amount spent in {category}: "))
        expenses[category] = spent

    print("\n--- Enter Budgeted Amounts ---")
    for category in expenses.keys():
        b = float(input(f"Budget for {category}: "))
        budget[category] = b

    return {
        "income": income,
        "expenses": expenses,
        "budget": budget
    }
