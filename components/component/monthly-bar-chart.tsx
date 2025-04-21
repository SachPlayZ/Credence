"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample monthly income vs expense data
const monthlyData = [
  {
    name: "Nov",
    income: 2800,
    expense: 1800,
  },
  {
    name: "Dec",
    income: 3200,
    expense: 2100,
  },
  {
    name: "Jan",
    income: 2900,
    expense: 1950,
  },
  {
    name: "Feb",
    income: 3100,
    expense: 2000,
  },
  {
    name: "Mar",
    income: 3300,
    expense: 1850,
  },
  {
    name: "Apr",
    income: 3240.5,
    expense: 692.87,
  },
]

export function MonthlyBarChart() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Monthly Income vs Expense</CardTitle>
        <CardDescription className="text-zinc-400">Comparison of your monthly income and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.5)" />
              <XAxis dataKey="name" tick={{ fill: "#a1a1aa" }} axisLine={{ stroke: "rgba(63, 63, 70, 0.5)" }} />
              <YAxis
                tick={{ fill: "#a1a1aa" }}
                axisLine={{ stroke: "rgba(63, 63, 70, 0.5)" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.8)",
                  borderColor: "rgba(63, 63, 70, 0.5)",
                  borderRadius: "0.5rem",
                  color: "#f4f4f5",
                }}
                cursor={{ fill: "rgba(63, 63, 70, 0.2)" }}
              />
              <Legend formatter={(value) => <span style={{ color: "#f4f4f5" }}>{value}</span>} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
