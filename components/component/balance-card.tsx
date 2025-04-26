"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface BalanceData {
  currentBalance: number;
  lastUpdated: string;
  monthlyStats: {
    totalIncome: number;
    totalExpenses: number;
  };
}

export function BalanceCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [balanceData, setBalanceData] = useState<BalanceData>({
    currentBalance: 0,
    lastUpdated: new Date().toISOString(),
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

  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting last updated date:", error);
      return "recently";
    }
  };

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Current Balance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-10 bg-zinc-800/50 rounded-md w-3/4"></div>
              <div className="h-6 bg-zinc-800/50 rounded-md w-1/2"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
                <div className="h-12 bg-zinc-800/50 rounded-md"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="relative">
              <p className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                ₹{balanceData.currentBalance.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-400 mt-1 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-zinc-600 mr-2"></span>
                Last updated {formatLastUpdated(balanceData.lastUpdated)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-800/20 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/50 hover:border-green-500/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">Monthly Income</p>
                </div>
                <p className="text-xl font-semibold text-green-500 mt-2">
                  +₹{balanceData.monthlyStats.totalIncome.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-zinc-800/20 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/50 hover:border-red-500/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="bg-red-500/20 p-2 rounded-full">
                    <TrendingDownIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">Monthly Expenses</p>
                </div>
                <p className="text-xl font-semibold text-red-500 mt-2">
                  -₹{balanceData.monthlyStats.totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}