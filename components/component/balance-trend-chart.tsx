"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface BalanceData {
  date: string;
  balance: number;
}

export function BalanceTrendChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<BalanceData[]>([]);

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const response = await fetch("/api/finance/balance-trend");
        if (!response.ok) {
          throw new Error("Failed to fetch balance trend data");
        }
        const balanceData = await response.json();
        setData(balanceData);
      } catch (error) {
        console.error("Error fetching balance trend:", error);
        toast.error("Failed to fetch balance trend data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/10 backdrop-blur-lg p-2 rounded-lg border border-white/20">
          <p className="text-sm font-medium">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-sm">Balance: ₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
            Balance Trend
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-zinc-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-zinc-400">No balance trend data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563eb"
                  fill="url(#gradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
