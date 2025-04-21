"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function StatsCards() {
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [savings, setSavings] = useState(0)

  const targetIncome = 3240.5
  const targetExpense = 692.87
  const targetSavings = targetIncome - targetExpense

  // Animate the counters
  useEffect(() => {
    const interval = setInterval(() => {
      setIncome((prev) => {
        const newValue = prev + (targetIncome - prev) * 0.1
        return Math.min(newValue, targetIncome)
      })

      setExpense((prev) => {
        const newValue = prev + (targetExpense - prev) * 0.1
        return Math.min(newValue, targetExpense)
      })

      setSavings((prev) => {
        const newValue = prev + (targetSavings - prev) * 0.1
        return Math.min(newValue, targetSavings)
      })

      if (
        Math.abs(income - targetIncome) < 0.1 &&
        Math.abs(expense - targetExpense) < 0.1 &&
        Math.abs(savings - targetSavings) < 0.1
      ) {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [income, expense, savings, targetIncome, targetExpense, targetSavings])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Income</p>
              <h3 className="text-2xl font-bold text-green-500 mt-1 animate-count-up">${income.toFixed(2)}</h3>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1 animate-count-up">${expense.toFixed(2)}</h3>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Net Savings</p>
              <h3 className="text-2xl font-bold text-orange-400 mt-1 animate-count-up">${savings.toFixed(2)}</h3>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <DollarSignIcon className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
