def analyze_budget_vs_expenses(data):
    result = {}
    total_spent = sum(data['expenses'].values())
    total_budget = sum(data['budget'].values())

    result['income'] = data['income']
    result['total_spent'] = total_spent
    result['total_budget'] = total_budget
    result['status'] = "over" if total_spent > total_budget else "under"

    result['details'] = []
    for category, spent in data['expenses'].items():
        budgeted = data['budget'].get(category, 0)
        difference = spent - budgeted
        result['details'].append({
            "category": category,
            "spent": spent,
            "budget": budgeted,
            "difference": difference,
            "status": "over" if difference > 0 else "under"
        })

    return result
