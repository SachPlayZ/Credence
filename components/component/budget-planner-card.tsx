"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { PlusIcon, SaveIcon, TrashIcon, BarChart3Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Get current month and year for default values
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
const currentYear = currentDate.getFullYear();

// Sample categories
const categories = [
  "Food & Dining",
  "Entertainment",
  "Transportation",
  "Shopping",
  "Utilities",
  "Housing",
  "Healthcare",
  "Personal",
  "Education",
  "Travel",
];

export function BudgetPlannerCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const [totalBudget, setTotalBudget] = useState("");
  const [budgetExists, setBudgetExists] = useState(false);
  const [categoryAllocations, setCategoryAllocations] = useState([
    { category: "Food & Dining", amount: "" },
    { category: "Entertainment", amount: "" },
    { category: "Transportation", amount: "" },
  ]);

  // Fetch existing budget on component mount or month/year change
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/finance/budget?month=${month}&year=${year}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch budget");
        }

        const data = await response.json();

        if (
          data &&
          data.totalBudget !== undefined &&
          data.allocations?.length > 0
        ) {
          setBudgetExists(true);
          setTotalBudget(data.totalBudget.toString());
          setCategoryAllocations(
            data.allocations.map((allocation: any) => ({
              category: allocation.category,
              amount: allocation.amount.toString(),
            }))
          );
        } else {
          // Reset form for new budget
          setBudgetExists(false);
          setTotalBudget("");
          setCategoryAllocations([
            { category: "Food & Dining", amount: "" },
            { category: "Entertainment", amount: "" },
            { category: "Transportation", amount: "" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
        toast.error("Failed to fetch budget data");
        setBudgetExists(false);
        // Reset form on error
        setTotalBudget("");
        setCategoryAllocations([
          { category: "Food & Dining", amount: "" },
          { category: "Entertainment", amount: "" },
          { category: "Transportation", amount: "" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [month, year]);

  const addCategoryRow = () => {
    setCategoryAllocations([
      ...categoryAllocations,
      { category: "", amount: "" },
    ]);
  };

  const removeCategoryRow = (index: number) => {
    const newAllocations = [...categoryAllocations];
    newAllocations.splice(index, 1);
    setCategoryAllocations(newAllocations);
  };

  const updateCategoryAllocation = (
    index: number,
    field: "category" | "amount",
    value: string
  ) => {
    const newAllocations = [...categoryAllocations];
    newAllocations[index][field] = value;
    setCategoryAllocations(newAllocations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate total allocated amount
      const totalAllocated = categoryAllocations.reduce(
        (sum, item) => sum + (Number.parseFloat(item.amount) || 0),
        0
      );

      const budgetData = {
        month: Number.parseInt(month),
        year: Number.parseInt(year),
        totalBudget: Number.parseFloat(totalBudget),
        allocations: categoryAllocations.map((item) => ({
          category: item.category,
          amount: Number.parseFloat(item.amount) || 0,
        })),
        unallocated: Number.parseFloat(totalBudget) - totalAllocated,
      };

      const response = await fetch("/api/finance/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save budget");
      }

      toast.success("Budget saved successfully");
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save budget"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Budget Planner
            </CardTitle>
          </div>
          <CardDescription className="text-zinc-400 ml-10 mt-1">
            Loading budget data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-pulse space-y-6 w-full">
              <div className="h-10 bg-zinc-800/50 rounded-md w-3/4 mx-auto"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetExists) {
    return (
      <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Budget Planner
            </CardTitle>
          </div>
          <CardDescription className="text-zinc-400 ml-3 mt-1">
            Budget for{" "}
            <span className="text-orange-400">
              {new Date(0, parseInt(month) - 1).toLocaleString("default", {
                month: "long",
              })}{" "}
              {year}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month" className="text-zinc-300 font-medium">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger
                    id="month"
                    className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
                  >
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()} className="hover:bg-zinc-800">
                        {new Date(0, m - 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-zinc-300 font-medium">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger
                    id="year"
                    className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
                  >
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Array.from(
                      { length: 5 },
                      (_, i) => currentYear - 2 + i
                    ).map((y) => (
                      <SelectItem key={y} value={y.toString()} className="hover:bg-zinc-800">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-700/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-500/20 p-2 rounded-full">
                    <BarChart3Icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-lg font-medium text-orange-400">
                    Total Budget: ₹{totalBudget}
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {categoryAllocations.map((allocation, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                      <span className="text-zinc-300 font-medium">
                        {allocation.category}
                      </span>
                      <span className="text-zinc-100 font-semibold bg-zinc-800/70 py-1 px-3 rounded-md">
                        ₹{allocation.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-center text-zinc-400 bg-zinc-800/30 py-3 px-4 rounded-lg border border-zinc-800/50 mt-4">
                Select a different month to create a new budget
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Budget Planner
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-400 ml-10 mt-1">
          Set your monthly budget and category allocations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month" className="text-zinc-300 font-medium">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger
                  id="month"
                  className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
                >
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()} className="hover:bg-zinc-800">
                      {new Date(0, m - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-zinc-300 font-medium">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger
                  id="year"
                  className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()} className="hover:bg-zinc-800">
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalBudget" className="text-zinc-300 font-medium">Total Budget</Label>
            <Input
              id="totalBudget"
              type="number"
              placeholder="₹0.00"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <Label className="text-zinc-300 font-medium">Category Allocations</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCategoryRow}
                className="h-8 px-3 text-orange-400 hover:text-orange-300 hover:bg-zinc-800/70 transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3 bg-zinc-800/20 p-4 rounded-lg border border-zinc-800/50">
              {categoryAllocations.map((allocation, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <Select
                    value={allocation.category}
                    onValueChange={(value) =>
                      updateCategoryAllocation(index, "category", value)
                    }
                  >
                    <SelectTrigger className="flex-1 bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="hover:bg-zinc-800">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="₹0.00"
                    value={allocation.amount}
                    onChange={(e) =>
                      updateCategoryAllocation(index, "amount", e.target.value)
                    }
                    className="w-28 bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategoryRow(index)}
                    className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    disabled={categoryAllocations.length <= 1}
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-pink-600 hover:from-orange-400 hover:via-orange-500 hover:to-pink-500 text-white font-medium py-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-6"
            disabled={isLoading}
          >
            <SaveIcon className="h-5 w-5" />
            {isLoading ? "Saving..." : "Save Budget"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}