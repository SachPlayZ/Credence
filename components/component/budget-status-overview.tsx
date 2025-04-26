"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
        `/api/finance/budget/status?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
      );

      if (response.status === 404) {
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

  useEffect(() => {
    fetchBudgetStatus();
    const interval = setInterval(fetchBudgetStatus, 30000);
    return () => clearInterval(interval);
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          totalBudget: editedBudget.totalBudget,
          allocations: editedBudget.categories.map((cat) => ({
            category: cat.category,
            amount: cat.budget,
          })),
          unallocated: 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to update budget");

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

    const newTotalBudget = newCategories.reduce((sum, cat) => sum + cat.budget, 0);

    setEditedBudget({
      ...editedBudget,
      totalBudget: newTotalBudget,
      totalRemaining: newTotalBudget - editedBudget.totalSpent,
      totalPercentage: (editedBudget.totalSpent / newTotalBudget) * 100,
      categories: newCategories,
    });
  };

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Budget Overview
            </CardTitle>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <SaveIcon className="h-5 w-5 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel}>
                  <XIcon className="h-5 w-5 text-red-500" />
                </Button>
              </>
            ) : (
              <Button size="icon" variant="ghost" onClick={handleEdit}>
                <EditIcon className="h-5 w-5 text-zinc-400" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-10 bg-zinc-800/50 rounded-md w-3/4 mx-auto"></div>
              <div className="h-6 bg-zinc-800/50 rounded-md w-1/2 mx-auto"></div>
              <div className="h-20 bg-zinc-800/50 rounded-md w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div>
              <p className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                ₹{budgetOverview.totalRemaining.toFixed(2)}
              </p>
              <p className="text-base text-zinc-400 mt-1 ml-3">
                Remaining from ₹{budgetOverview.totalBudget.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              {(
                isEditing ? editedBudget?.categories : budgetOverview.categories
              )?.map((category, index) => (
                <div
                  key={index}
                  className="bg-zinc-800/20 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-zinc-400">{category.category}</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={category.budget}
                        onChange={(e) => handleBudgetChange(index, parseFloat(e.target.value))}
                        className="w-24 h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-zinc-300">₹{category.budget.toFixed(2)}</p>
                    )}
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <p className="text-xs text-zinc-500 mt-1">
                    Spent: ₹{category.spent.toFixed(2)} / Remaining: ₹{category.remaining.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
