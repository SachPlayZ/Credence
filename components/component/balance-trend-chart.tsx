"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample balance trend data
const balanceTrendData = [
  { date: "Nov 1", balance: 1200 },
  { date: "Nov 15", balance: 1500 },
  { date: "Dec 1", balance: 1350 },
  { date: "Dec 15", balance: 1800 },
  { date: "Jan 1", balance: 1650 },
  { date: "Jan 15", balance: 2000 },
  { date: "Feb 1", balance: 1900 },
  { date: "Feb 15", balance: 2200 },
  { date: "Mar 1", balance: 2100 },
  { date: "Mar 15", balance: 2400 },
  { date: "Apr 1", balance: 2300 },
  { date: "Apr 15", balance: 2547.63 },
]

export function BalanceTrendChart() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Balance Trend</CardTitle>
        <CardDescription className="text-zinc-400">How your balance has evolved over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.5)" />
              <XAxis dataKey="date" tick={{ fill: "#a1a1aa" }} axisLine={{ stroke: "rgba(63, 63, 70, 0.5)" }} />
              <YAxis
                tick={{ fill: "#a1a1aa" }}
                axisLine={{ stroke: "rgba(63, 63, 70, 0.5)" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Balance"]}
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.8)",
                  borderColor: "rgba(63, 63, 70, 0.5)",
                  borderRadius: "0.5rem",
                  color: "#f4f4f5",
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", r: 4 }}
                activeDot={{ r: 6, fill: "#fb923c" }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
