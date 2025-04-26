/**
 * Budget vs Expenses Analysis Module
 * 
 * This module analyzes budget allocations against actual expenses
 * to provide insights on spending patterns and budget adherence.
 */
import {
  BudgetAnalysis,
  BudgetAnalysisInput,
  CategoryAnalysis,
} from "../types/ai";

/**
 * Analyzes the difference between budgeted amounts and actual expenses
 * 
 * @param data - Object containing income, budget allocations, and actual expenses
 * @returns A structured analysis with overall totals and category-by-category breakdown
 */
export function analyzeBudgetVsExpenses(
  data: BudgetAnalysisInput
): BudgetAnalysis {
  // Calculate total spending across all categories
  const total_spent = Object.values(data.expenses).reduce((a, b) => a + b, 0);
  
  // Calculate total budgeted amount across all categories
  const total_budget = Object.values(data.budget).reduce((a, b) => a + b, 0);

  // Generate detailed analysis for each spending category
  const details: CategoryAnalysis[] = Object.entries(data.expenses).map(
    ([category, spent]) => {
      // Get budgeted amount for this category (default to 0 if not found)
      const budgeted = data.budget[category] || 0;
      
      // Calculate difference between actual spending and budget
      // Positive value means over budget, negative means under budget
      const difference = spent - budgeted;
      
      return {
        category,
        spent,          // Actual amount spent
        budget: budgeted, // Allocated budget amount
        difference,     // Amount over/under budget
        status: difference > 0 ? "over" : "under", // Simple status indicator
      };
    }
  );

  // Return comprehensive analysis object with both summary and detailed information
  return {
    income: data.income,     // Total income (for reference)
    total_spent,             // Sum of all expenses
    total_budget,            // Sum of all budget allocations
    status: total_spent > total_budget ? "over" : "under", // Overall budget status
    details,                 // Category-by-category breakdown
  };
}
