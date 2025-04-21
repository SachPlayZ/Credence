"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";

interface BalanceData {
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
  };
}

export function StatsCards() {
  const [isLoading, setIsLoading] = useState(true);
  const [balanceData, setBalanceData] = useState<BalanceData>({
    monthlyStats: {
      totalIncome: 0,
      totalExpenses: 0,
    },
  });

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const response = await fetch("/api/finance/balance");
        if (!response.ok) {
          throw new Error("Failed to fetch balance data");
        }
        const data = await response.json();
        setBalanceData(data);
      } catch (error) {
        console.error("Error fetching balance data:", error);
        toast.error("Failed to fetch balance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceData();
  }, []);

  const savings =
    balanceData.monthlyStats.totalIncome -
    balanceData.monthlyStats.totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Income</p>
              <h3 className="text-2xl font-bold text-green-500 mt-1">
                {isLoading
                  ? "Loading..."
                  : `₹${balanceData.monthlyStats.totalIncome.toFixed(2)}`}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">
                Total Expenses
              </p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">
                {isLoading
                  ? "Loading..."
                  : `₹${balanceData.monthlyStats.totalExpenses.toFixed(2)}`}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Savings</p>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  savings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {isLoading ? "Loading..." : `₹${savings.toFixed(2)}`}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div
              className={`h-12 w-12 rounded-full ${
                savings >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              } flex items-center justify-center`}
            >
              <DollarSignIcon
                className={`h-6 w-6 ${
                  savings >= 0 ? "text-green-500" : "text-red-500"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
