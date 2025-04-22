export interface BudgetAnalysisInput {
  income: number;
  expenses: Record<string, number>;
  budget: Record<string, number>;
}

export interface CategoryAnalysis {
  category: string;
  spent: number;
  budget: number;
  difference: number;
  status: "over" | "under";
}

export interface BudgetAnalysis {
  income: number;
  total_spent: number;
  total_budget: number;
  status: "over" | "under";
  details: CategoryAnalysis[];
}

export interface FinancialReport {
  summary: string;

  insights: {
    title: string;
    description: string;
    type: "positive" | "warning" | "negative";
  }[];
  recommendations: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  overspending_categories: {
    category: string;
    overspent_by: number;
  }[];
  actionable_advice: string[];
  general_tips: string[];
}
