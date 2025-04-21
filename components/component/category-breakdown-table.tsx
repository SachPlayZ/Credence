"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample category breakdown data
const categoryBreakdownData = [
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

export function CategoryBreakdownTable() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Category Breakdown</CardTitle>
        <CardDescription className="text-zinc-400">Monthly category-wise spending and budget status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-zinc-800/50">
            <TableRow>
              <TableHead className="text-zinc-300">Category</TableHead>
              <TableHead className="text-zinc-300">Budget</TableHead>
              <TableHead className="text-zinc-300">Spent</TableHead>
              <TableHead className="text-zinc-300">Remaining</TableHead>
              <TableHead className="text-zinc-300">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryBreakdownData.map((item) => (
              <TableRow key={item.category}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell>${item.budget.toFixed(2)}</TableCell>
                <TableCell>${item.spent.toFixed(2)}</TableCell>
                <TableCell className={item.remaining < 0 ? "text-red-500" : ""}>${item.remaining.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={item.percentage}
                      className="h-2 w-full max-w-[100px] bg-zinc-800"
                      indicatorClassName={
                        item.percentage >= 100
                          ? "bg-red-500"
                          : item.percentage >= 80
                            ? "bg-orange-500"
                            : "orange-gradient"
                      }
                    />
                    <span className="text-xs text-zinc-400">{item.percentage}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
