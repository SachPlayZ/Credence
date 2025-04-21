"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Sample budget status data
const budgetStatusData = [
  {
    category: "Food & Dining",
    budget: 400,
    spent: 320.75,
    remaining: 79.25,
    percentage: 80,
  },
  {
    category: "Entertainment",
    budget: 100,
    spent: 95.5,
    remaining: 4.5,
    percentage: 95,
  },
  {
    category: "Transportation",
    budget: 150,
    spent: 110.25,
    remaining: 39.75,
    percentage: 73,
  },
  {
    category: "Shopping",
    budget: 200,
    spent: 210.99,
    remaining: -10.99,
    percentage: 105,
  },
  {
    category: "Utilities",
    budget: 200,
    spent: 145.3,
    remaining: 54.7,
    percentage: 73,
  },
]

// Calculate totals
const totalBudget = budgetStatusData.reduce((sum, item) => sum + item.budget, 0)
const totalSpent = budgetStatusData.reduce((sum, item) => sum + item.spent, 0)
const totalRemaining = totalBudget - totalSpent
const totalPercentage = Math.round((totalSpent / totalBudget) * 100)

export function BudgetStatusOverview() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Budget Status</CardTitle>
        <CardDescription className="text-zinc-400">Current month&apos;s budget overview</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Total Budget Overview */}
        <div className="mb-6 p-4 bg-zinc-800/30 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-lg">Total Budget</span>
            <span className={totalRemaining < 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
              ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}
            </span>
          </div>
          <Progress
            value={totalPercentage}
            className="h-3 bg-zinc-800"
            indicatorClassName={
              totalPercentage >= 100 ? "bg-red-500" : totalPercentage >= 80 ? "bg-orange-500" : "orange-gradient"
            }
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-zinc-400">{totalPercentage}% spent</span>
            <span className={`text-sm ${totalRemaining < 0 ? "text-red-500" : "text-green-500"}`}>
              {totalRemaining < 0 ? "Over by " : "Remaining: "}${Math.abs(totalRemaining).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          {budgetStatusData.map((budget) => (
            <div key={budget.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{budget.category}</span>
                <span className={budget.percentage >= 100 ? "text-red-500" : "text-zinc-400"}>
                  ${budget.spent.toFixed(2)} / ${budget.budget.toFixed(2)}
                </span>
              </div>
              <Progress
                value={budget.percentage}
                className="h-2 bg-zinc-800"
                indicatorClassName={
                  budget.percentage >= 100
                    ? "bg-red-500"
                    : budget.percentage >= 80
                      ? "bg-orange-500"
                      : "orange-gradient"
                }
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{budget.percentage}% spent</span>
                <span className={`text-xs ${budget.remaining < 0 ? "text-red-500" : "text-green-500"}`}>
                  {budget.remaining < 0 ? "Over by " : "Remaining: "}${Math.abs(budget.remaining).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
