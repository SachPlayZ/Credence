"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CategoryBreakdown {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  transactions: number;
  status: "exceeded" | "warning" | "good";
}

interface BreakdownData {
  breakdown: CategoryBreakdown[];
  totals: {
    budgeted: number;
    spent: number;
    remaining: number;
  };
  month: number;
  year: number;
}

interface BudgetAllocation {
  category: string;
  amount: number;
}

interface BudgetData {
  totalBudget: number;
  allocations: BudgetAllocation[];
  unallocated: number;
  month: number;
  year: number;
}

export function CategoryBreakdownTable() {
  const [breakdownData, setBreakdownData] = useState<BreakdownData | null>(
    null
  );
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Fetch both breakdown and budget data
        const [breakdownResponse, budgetResponse] = await Promise.all([
          fetch("/api/finance/expenses/breakdown"),
          fetch(`/api/finance/budget?month=${month}&year=${year}`),
        ]);

        if (!breakdownResponse.ok || !budgetResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [breakdownResult, budgetResult] = await Promise.all([
          breakdownResponse.json(),
          budgetResponse.json(),
        ]);

        setBreakdownData(breakdownResult);
        setBudgetData(budgetResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="glassmorphism rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Category Breakdown
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Loading...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glassmorphism rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Category Breakdown
          </CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!breakdownData || !budgetData || breakdownData.breakdown.length === 0) {
    return (
      <Card className="glassmorphism rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Category Breakdown
          </CardTitle>
          <CardDescription className="text-zinc-400">
            No budget data available for this month
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const monthName = new Date(
    breakdownData.year,
    breakdownData.month - 1
  ).toLocaleString("default", { month: "long" });

  // Combine breakdown and budget data
  const combinedData = breakdownData.breakdown.map((item) => {
    const budgetAllocation = budgetData.allocations.find(
      (allocation) => allocation.category === item.category
    );
    const budgeted = budgetAllocation?.amount || 0;
    const remaining = budgeted - item.spent;
    const percentageUsed = budgeted > 0 ? (item.spent / budgeted) * 100 : 0;
    const status =
      budgeted === 0
        ? "good"
        : percentageUsed >= 100
        ? "exceeded"
        : percentageUsed >= 80
        ? "warning"
        : "good";

    return {
      ...item,
      budgeted,
      remaining,
      percentageUsed,
      status,
    };
  });

  // Add categories that have a budget but no expenses
  budgetData.allocations.forEach((allocation) => {
    if (!combinedData.some((item) => item.category === allocation.category)) {
      combinedData.push({
        category: allocation.category,
        budgeted: allocation.amount,
        spent: 0,
        remaining: allocation.amount,
        percentageUsed: 0,
        transactions: 0,
        status: "good",
      });
    }
  });

  // Sort by percentage used (descending)
  combinedData.sort((a, b) => b.percentageUsed - a.percentageUsed);

  // Calculate totals
  const totals = {
    budgeted: budgetData.totalBudget,
    spent: breakdownData.totals.spent,
    remaining: budgetData.totalBudget - breakdownData.totals.spent,
    percentageUsed:
      budgetData.totalBudget > 0
        ? (breakdownData.totals.spent / budgetData.totalBudget) * 100
        : 0,
  };

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Category Breakdown
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-400 ml-3">
          {monthName} {breakdownData.year} - Budget Overview
          {budgetData.unallocated > 0 && (
            <span className="ml-2 text-yellow-500">
              (₹{budgetData.unallocated.toFixed(2)} unallocated)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
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
              {combinedData.map((item) => (
                <TableRow key={item.category} className="bg-zinc-800/10">
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>₹{item.budgeted.toFixed(2)}</TableCell>
                  <TableCell>₹{item.spent.toFixed(2)}</TableCell>
                  <TableCell className={item.remaining < 0 ? "text-red-500" : ""}>
                    ₹{item.remaining.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.budgeted > 0 ? item.percentageUsed : 0}
                        className={cn(
                          "h-2 w-full max-w-[100px]",
                          item.status === "exceeded"
                            ? "bg-red-500"
                            : item.status === "warning"
                            ? "bg-orange-500"
                            : "orange-gradient"
                        )}
                      />
                      <span className="text-xs text-zinc-400">
                        {item.budgeted > 0
                          ? `${item.percentageUsed.toFixed(1)}%`
                          : "No budget"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell>₹{totals.budgeted.toFixed(2)}</TableCell>
                <TableCell>₹{totals.spent.toFixed(2)}</TableCell>
                <TableCell className={totals.remaining < 0 ? "text-red-500" : ""}>
                  ₹{totals.remaining.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={totals.percentageUsed}
                      className={cn(
                        "h-2 w-full max-w-[100px]",
                        totals.percentageUsed >= 100
                          ? "bg-red-500"
                          : totals.percentageUsed >= 80
                          ? "bg-orange-500"
                          : "orange-gradient"
                      )}
                    />
                    <span className="text-xs text-zinc-400">
                      {totals.percentageUsed.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
