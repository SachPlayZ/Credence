"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { PlusIcon, SaveIcon, TrashIcon } from "lucide-react";
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
      <Card className="glassmorphism rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Budget Planner</CardTitle>
          <CardDescription className="text-zinc-400">
            Loading budget data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-zinc-400">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetExists) {
    return (
      <Card className="glassmorphism rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Budget Planner</CardTitle>
          <CardDescription className="text-zinc-400">
            Budget for{" "}
            {new Date(0, parseInt(month) - 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger
                    id="month"
                    className="bg-zinc-800/50 border-zinc-700"
                  >
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(0, m - 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger
                    id="year"
                    className="bg-zinc-800/50 border-zinc-700"
                  >
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 5 },
                      (_, i) => currentYear - 2 + i
                    ).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/30 rounded-lg">
                <p className="text-zinc-300 font-medium">
                  Total Budget: ₹{totalBudget}
                </p>
                <div className="mt-4 space-y-2">
                  {categoryAllocations.map((allocation, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-zinc-400">
                        {allocation.category}
                      </span>
                      <span className="text-zinc-300">
                        ₹{allocation.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-center text-zinc-400">
                Select a different month to create a new budget
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Budget Planner</CardTitle>
        <CardDescription className="text-zinc-400">
          Set your monthly budget and category allocations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger
                  id="month"
                  className="bg-zinc-800/50 border-zinc-700"
                >
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(0, m - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger
                  id="year"
                  className="bg-zinc-800/50 border-zinc-700"
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget</Label>
            <Input
              id="totalBudget"
              type="number"
              placeholder="₹0.00"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Category Allocations</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCategoryRow}
                className="h-8 px-2 text-orange-400 hover:text-orange-300 hover:bg-zinc-800"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            <div className="space-y-2">
              {categoryAllocations.map((allocation, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={allocation.category}
                    onValueChange={(value) =>
                      updateCategoryAllocation(index, "category", value)
                    }
                  >
                    <SelectTrigger className="flex-1 bg-zinc-800/50 border-zinc-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
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
                    className="w-24 bg-zinc-800/50 border-zinc-700"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategoryRow(index)}
                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-zinc-800"
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
            className="w-full orange-gradient orange-glow transition-shadow flex items-center gap-2"
            disabled={isLoading}
          >
            <SaveIcon className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Budget"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
