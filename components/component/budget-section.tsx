"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Sample budget data
const budgetData = [
  {
    category: "Food & Dining",
    spent: 320.75,
    limit: 400,
    percentage: 80,
  },
  {
    category: "Entertainment",
    spent: 95.5,
    limit: 100,
    percentage: 95,
  },
  {
    category: "Transportation",
    spent: 110.25,
    limit: 150,
    percentage: 73,
  },
  {
    category: "Shopping",
    spent: 210.99,
    limit: 200,
    percentage: 105,
  },
  {
    category: "Utilities",
    spent: 145.3,
    limit: 200,
    percentage: 73,
  },
]

export function BudgetSection() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Budget Overview</CardTitle>
        <CardDescription className="text-zinc-400">Track your spending against category budgets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetData.map((budget) => (
            <div key={budget.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{budget.category}</span>
                <span className={budget.percentage >= 100 ? "text-red-500" : "text-zinc-400"}>
                  ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                </span>
              </div>
              <Progress
                value={budget.percentage}
                className={`h-2 ${
                  budget.percentage >= 100
                    ? "bg-red-500"
                    : budget.percentage >= 80
                    ? "bg-orange-500"
                    : "orange-gradient"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
