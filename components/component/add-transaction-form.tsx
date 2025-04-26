"use client";

import type React from "react";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
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

export function AddTransactionForm({
  onTransactionAdded,
}: {
  onTransactionAdded?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/finance/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add transaction");
      }
      toast.success("Transaction added successfully");

      // Reset form
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
      });

      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Add Transaction
          </CardTitle>
        </div>
        <CardDescription className="text-zinc-400 ml-3 mt-1">
          Record a new transaction to track your finances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-zinc-300 font-medium">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger
                  id="type"
                  className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="income" className="hover:bg-zinc-800">Income</SelectItem>
                  <SelectItem value="expense" className="hover:bg-zinc-800">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-300 font-medium">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="₹0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-zinc-300 font-medium">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger
                id="category"
                className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="food" className="hover:bg-zinc-800">Food & Dining</SelectItem>
                <SelectItem value="shopping" className="hover:bg-zinc-800">Shopping</SelectItem>
                <SelectItem value="housing" className="hover:bg-zinc-800">Housing</SelectItem>
                <SelectItem value="transportation" className="hover:bg-zinc-800">Transportation</SelectItem>
                <SelectItem value="entertainment" className="hover:bg-zinc-800">Entertainment</SelectItem>
                <SelectItem value="utilities" className="hover:bg-zinc-800">Utilities</SelectItem>
                <SelectItem value="income" className="hover:bg-zinc-800">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-300 font-medium">Description</Label>
            <Input
              id="description"
              placeholder="Transaction description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-pink-600 hover:from-orange-400 hover:via-orange-500 hover:to-pink-500 text-white font-medium py-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-4"
            disabled={isLoading}
          >
            <PlusIcon className="h-5 w-5" />
            {isLoading ? "Processing..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}