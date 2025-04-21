"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalPercentage: number;
  categories: BudgetStatus[];
}

export function BudgetStatusOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState<BudgetOverview | null>(null);
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview>({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    totalPercentage: 0,
    categories: [],
  });

  const fetchBudgetStatus = async () => {
    try {
      const currentDate = new Date();
      const response = await fetch(
        `/api/finance/budget/status?month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`
      );

      if (response.status === 404) {
        // No budget exists for this month
        setBudgetOverview({
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          totalPercentage: 0,
          categories: [],
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch budget status");
      }

      const data = await response.json();
      setBudgetOverview(data);
      setEditedBudget(null);
    } catch (error) {
      console.error("Error fetching budget status:", error);
      toast.error("Failed to fetch budget status");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchBudgetStatus();
    const interval = setInterval(fetchBudgetStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Re-fetch when editing is done
  useEffect(() => {
    if (!isEditing) {
      fetchBudgetStatus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedBudget({
      ...budgetOverview,
      categories: budgetOverview.categories.map((cat) => ({ ...cat })),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBudget(null);
  };

  const handleSave = async () => {
    if (!editedBudget) return;

    try {
      const currentDate = new Date();
      const response = await fetch("/api/finance/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          totalBudget: editedBudget.totalBudget,
          allocations: editedBudget.categories.map((cat) => ({
            category: cat.category,
            amount: cat.budget,
          })),
          unallocated: 0, // Calculate if needed
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update budget");
      }

      toast.success("Budget updated successfully");
      setIsEditing(false);
      fetchBudgetStatus();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget");
    }
  };

  const handleBudgetChange = (categoryIndex: number, newBudget: number) => {
    if (!editedBudget) return;

    const newCategories = [...editedBudget.categories];
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      budget: newBudget,
      remaining: newBudget - newCategories[categoryIndex].spent,
      percentage: (newCategories[categoryIndex].spent / newBudget) * 100,
    };

    const newTotalBudget = newCategories.reduce(
      (sum, cat) => sum + cat.budget,
      0
    );

    setEditedBudget({
      ...editedBudget,
      totalBudget: newTotalBudget,
      totalRemaining: newTotalBudget - editedBudget.totalSpent,
      totalPercentage: (editedBudget.totalSpent / newTotalBudget) * 100,
      categories: newCategories,
    });
  };

  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Budget Status</CardTitle>
          <CardDescription className="text-zinc-400">
            Current month&apos;s budget overview
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-zinc-800"
              >
                <XIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 px-2 text-green-400 hover:text-green-300 hover:bg-zinc-800"
              >
                <SaveIcon className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 px-2 text-orange-400 hover:text-orange-300 hover:bg-zinc-800"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-zinc-400">
            Loading budget status...
          </div>
        ) : (
          <>
            {/* Total Budget Overview */}
            <div className="mb-6 p-4 bg-zinc-800/30 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-lg">Total Budget</span>
                <span
                  className={
                    (isEditing
                      ? editedBudget?.totalRemaining ??
                        budgetOverview.totalRemaining
                      : budgetOverview.totalRemaining) < 0
                      ? "text-red-500 font-medium"
                      : "text-green-500 font-medium"
                  }
                >
                  ₹{budgetOverview.totalSpent.toFixed(2)} / ₹
                  {(isEditing
                    ? editedBudget?.totalBudget ?? budgetOverview.totalBudget
                    : budgetOverview.totalBudget
                  ).toFixed(2)}
                </span>
              </div>
              <Progress
                value={
                  isEditing
                    ? editedBudget?.totalPercentage ??
                      budgetOverview.totalPercentage
                    : budgetOverview.totalPercentage
                }
                className={cn(
                  "h-3",
                  (isEditing
                    ? editedBudget?.totalPercentage ??
                      budgetOverview.totalPercentage
                    : budgetOverview.totalPercentage) >= 100
                    ? "bg-red-500"
                    : (isEditing
                        ? editedBudget?.totalPercentage ??
                          budgetOverview.totalPercentage
                        : budgetOverview.totalPercentage) >= 80
                    ? "bg-orange-500"
                    : "orange-gradient"
                )}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-zinc-400">
                  {(isEditing
                    ? editedBudget?.totalPercentage ??
                      budgetOverview.totalPercentage
                    : budgetOverview.totalPercentage
                  ).toFixed(1)}
                  % spent
                </span>
                <span
                  className={`text-sm ${
                    (isEditing
                      ? editedBudget?.totalRemaining ??
                        budgetOverview.totalRemaining
                      : budgetOverview.totalRemaining) < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {(isEditing
                    ? editedBudget?.totalRemaining ??
                      budgetOverview.totalRemaining
                    : budgetOverview.totalRemaining) < 0
                    ? "Over by "
                    : "Remaining: "}
                  ₹
                  {Math.abs(
                    isEditing
                      ? editedBudget?.totalRemaining ??
                          budgetOverview.totalRemaining
                      : budgetOverview.totalRemaining
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              {(isEditing
                ? editedBudget?.categories ?? budgetOverview.categories
                : budgetOverview.categories
              ).map((budget, index) => (
                <div key={budget.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{budget.category}</span>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={budget.budget}
                          onChange={(e) =>
                            handleBudgetChange(
                              index,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 h-7 px-2 text-right bg-zinc-800/50 border-zinc-700"
                        />
                      ) : (
                        <span
                          className={
                            budget.percentage >= 100
                              ? "text-red-500"
                              : "text-zinc-400"
                          }
                        >
                          ₹{budget.spent.toFixed(2)} / ₹
                          {budget.budget.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className={cn(
                      "h-2",
                      budget.percentage >= 100
                        ? "bg-red-500"
                        : budget.percentage >= 80
                        ? "bg-orange-500"
                        : "orange-gradient"
                    )}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">
                      {budget.percentage.toFixed(1)}% spent
                    </span>
                    <span
                      className={`text-xs ${
                        budget.remaining < 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {budget.remaining < 0 ? "Over by " : "Remaining: "}₹
                      {Math.abs(budget.remaining).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
