import {
  BudgetAnalysis,
  BudgetAnalysisInput,
  CategoryAnalysis,
} from "../types/ai";

export function analyzeBudgetVsExpenses(
  data: BudgetAnalysisInput
): BudgetAnalysis {
  const total_spent = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  const total_budget = Object.values(data.budget).reduce((a, b) => a + b, 0);

  const details: CategoryAnalysis[] = Object.entries(data.expenses).map(
    ([category, spent]) => {
      const budgeted = data.budget[category] || 0;
      const difference = spent - budgeted;
      return {
        category,
        spent,
        budget: budgeted,
        difference,
        status: difference > 0 ? "over" : "under",
      };
    }
  );

  return {
    income: data.income,
    total_spent,
    total_budget,
    status: total_spent > total_budget ? "over" : "under",
    details,
  };
}
