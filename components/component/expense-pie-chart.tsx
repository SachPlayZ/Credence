"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample expense data by category
const expenseData = [
  { name: "Food & Dining", value: 320.75, color: "#f97316" },
  { name: "Entertainment", value: 95.5, color: "#fb923c" },
  { name: "Transportation", value: 110.25, color: "#fdba74" },
  { name: "Shopping", value: 210.99, color: "#ef4444" },
  { name: "Utilities", value: 145.3, color: "#f87171" },
]

export function ExpensePieChart() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Expenses by Category</CardTitle>
        <CardDescription className="text-zinc-400">Breakdown of your spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.8)",
                  borderColor: "rgba(63, 63, 70, 0.5)",
                  borderRadius: "0.5rem",
                  color: "#f4f4f5",
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => <span style={{ color: "#f4f4f5" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
