"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";

interface CategoryBreakdown {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  transactions: number;
  status: "exceeded" | "warning" | "good";
}

interface BreakdownData {
  breakdown: CategoryBreakdown[];
  totals: {
    budgeted: number;
    spent: number;
    remaining: number;
  };
  month: number;
  year: number;
}

// Consistent colors for categories
const COLORS = {
  "Food & Dining": "#FF8042",
  Shopping: "#00C49F",
  Housing: "#0088FE",
  Transportation: "#FFBB28",
  Entertainment: "#FF6B6B",
  Utilities: "#4CAF50",
  Other: "#9C27B0",
};

// Custom active shape component for hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-800/90 p-3 rounded-lg shadow-lg border border-zinc-700">
        <p className="font-medium text-white">{data.name}</p>
        <p className="text-sm text-zinc-300">
          Amount: ₹{data.value.toFixed(2)}
        </p>
        <p className="text-sm text-zinc-300">Share: {data.percentage}</p>
        {data.transactions > 0 && (
          <p className="text-sm text-zinc-400 mt-1">
            {data.transactions} transaction{data.transactions === 1 ? "" : "s"}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom legend
const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-wrap justify-center gap-4 px-4">
      {payload.map((entry: any, index: number) => (
        <li key={`legend-${index}`} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">
            {entry.value} ({entry.payload.percentage})
          </span>
        </li>
      ))}
    </ul>
  );
};

export function ExpensePieChart() {
  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/finance/expenses/breakdown");
        if (!response.ok) {
          throw new Error("Failed to fetch category data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.breakdown.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          No expenses recorded this month
        </CardContent>
      </Card>
    );
  }

  // Filter out categories with no spending and calculate percentages
  const pieData = data.breakdown
    .filter((item) => item.spent > 0)
    .map((item) => ({
      name: item.category,
      value: item.spent,
      percentage: ((item.spent / data.totals.spent) * 100).toFixed(1) + "%",
      transactions: item.transactions,
    }))
    .sort((a, b) => b.value - a.value);

  const monthName = new Date(data.year, data.month - 1).toLocaleString(
    "default",
    { month: "long" }
  );

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle>
          {monthName} {data.year} - Expenses by Category
          <span className="block text-sm font-normal text-zinc-400 mt-1">
            Total: ₹{data.totals.spent.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage})`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || "#808080"}
                  className="transition-opacity duration-200"
                  style={{
                    opacity:
                      activeIndex === -1 || activeIndex === index ? 1 : 0.6,
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={60}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
