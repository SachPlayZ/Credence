"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
}

// Custom active bar shape
const CustomBar = (props: any) => {
  const { fill, x, y, width, height, isActive } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        opacity={isActive ? 1 : 0.6}
        rx={4}
        ry={4}
        className="transition-all duration-200"
      />
      {isActive && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          fill="none"
          stroke={fill}
          strokeWidth={2}
          rx={6}
          ry={6}
          className="transition-all duration-200"
        />
      )}
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload[0].value;
    const expenses = payload[1].value;
    const savings = income - expenses;
    const savingsPercentage = ((savings / income) * 100).toFixed(1);

    return (
      <div className="bg-zinc-800/90 p-3 rounded-lg shadow-lg border border-zinc-700">
        <p className="font-medium text-white mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-green-400">Income:</span>{" "}
            <span className="text-zinc-300">₹{income.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            <span className="text-red-400">Expenses:</span>{" "}
            <span className="text-zinc-300">₹{expenses.toFixed(2)}</span>
          </p>
          <div className="border-t border-zinc-700 my-2" />
          <p className="text-sm">
            <span className="text-blue-400">Savings:</span>{" "}
            <span
              className={`${savings >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              ₹{savings.toFixed(2)}
            </span>
          </p>
          <p className="text-xs text-zinc-400">
            Savings Rate: {savingsPercentage}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend
const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex justify-center gap-6 px-4">
      {payload.map((entry: any, index: number) => (
        <li key={`legend-${index}`} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-zinc-300">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function MonthlyBarChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<MonthlyData[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch("/api/finance/monthly-comparison");
        if (!response.ok) {
          throw new Error("Failed to fetch monthly data");
        }
        const monthlyData = await response.json();
        setData(monthlyData);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        toast.error("Failed to fetch monthly comparison data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 border-zinc-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-zinc-400">
          Monthly Income vs Expenses
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Comparison of monthly income and expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-zinc-400">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-zinc-400">No monthly data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                onMouseLeave={handleMouseLeave}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(63, 63, 70, 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a1a1aa" }}
                  axisLine={{ stroke: "rgba(63, 63, 70, 0.5)" }}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#a1a1aa" }}
                  axisLine={{ stroke: "rgba(63, 63, 70, 0.5)" }}
                  tickFormatter={(value) => `₹${value}`}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                />
                <Legend content={<CustomLegend />} />
                <Bar
                  dataKey="income"
                  name="Income"
                  shape={<CustomBar />}
                  onMouseEnter={(data, index) => handleMouseEnter(data, index)}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`income-${index}`}
                      fill="#22c55e"
                      // @ts-expect-error - isActive is used by CustomBar
                      isActive={index === activeIndex}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  shape={<CustomBar />}
                  onMouseEnter={(data, index) => handleMouseEnter(data, index)}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`expenses-${index}`}
                      fill="#ef4444"
                      // @ts-expect-error - isActive is used by CustomBar
                      isActive={index === activeIndex}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
