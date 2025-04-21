"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
    <Card className="glassmorphism rounded-2xl orange-glow transition-shadow">
      <CardHeader>
        <CardTitle className="text-zinc-200">Current Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <p className="text-zinc-400">Loading balance data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-orange-400">
                ₹{balanceData.currentBalance.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-400">
                Last updated {formatLastUpdated(balanceData.lastUpdated)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-400">Incoming</p>
                <p className="text-lg font-semibold text-green-500">
                  +₹{balanceData.monthlyStats.totalIncome.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Outgoing</p>
                <p className="text-lg font-semibold text-red-500">
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
