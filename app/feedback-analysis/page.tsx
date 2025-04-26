"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import Image from "next/image";

interface FeedbackAnalysis {
  totalResponses: number;
  ratingAverages: Record<string, number>;
  featureUsage: Record<string, number>;
  desiredImprovements: Record<string, number>;
  usageFrequency: Record<string, number>;
  discoverySource: Record<string, number>;
  priorBudgetingSkill: Record<string, number>;
  memberFeedback: Array<{
    userName: string;
    userEmail: string;
    userImage: string;
    submittedAt: string;
    favoriteFeature: string;
    difficultAspect: string;
    suggestions: string;
    mostUsedFeatures: string[];
  }>;
}

const COLORS = {
  primary: ["#FF8042", "#00C49F", "#0088FE", "#FFBB28", "#FF6B6B"],
  secondary: ["#4CAF50", "#9C27B0", "#FF5722", "#2196F3", "#FFC107"],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800/90 p-3 rounded-lg shadow-lg border border-zinc-700">
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-zinc-300">Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function FeedbackAnalysis() {
  const [data, setData] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/feedback/analysis");
        if (!response.ok) {
          throw new Error("Failed to fetch feedback analysis");
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
      <div className="min-h-screen p-8">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-zinc-400">Loading feedback analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-red-500">{error || "Failed to load data"}</p>
        </div>
      </div>
    );
  }

  const featureData = Object.entries(data.featureUsage).map(([key, value]) => ({
    name: key,
    value,
  }));

  const improvementData = Object.entries(data.desiredImprovements).map(
    ([key, value]) => ({
      name: key,
      value,
    })
  );

  return (
    <div className="min-h-screen space-y-6 p-8">
      <Navbar />

      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="text-2xl">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-400">
              {data.totalResponses}
            </p>
          </CardContent>
        </Card>

        {Object.entries(data.ratingAverages).map(([key, value]) => (
          <Card key={key} className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-orange-400">{value}</p>
                <p className="text-sm text-zinc-400">/ 5</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Feature Usage and Improvements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Feature Usage Chart */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Most Used Features</CardTitle>
            <CardDescription>Feature usage distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={featureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {featureData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.primary[index % COLORS.primary.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desired Improvements Chart */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Desired Improvements</CardTitle>
            <CardDescription>Most requested features</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={improvementData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fill: "#a1a1aa" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Member Feedback List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Member Feedback</CardTitle>
            <CardDescription>
              Detailed feedback from all members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.memberFeedback.map((feedback, index) => (
                <div
                  key={index}
                  className="border-b border-zinc-800 last:border-0 pb-8 last:pb-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* User Profile Section */}
                    <div className="flex-shrink-0">
                      <Image
                        src={feedback.userImage || "/default-avatar.png"}
                        alt={feedback.userName}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    </div>

                    {/* User Info and Feedback Content */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-zinc-200">
                            {feedback.userName || "Anonymous"}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {new Date(feedback.submittedAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {feedback.mostUsedFeatures?.map((feature: string) => (
                            <Badge
                              key={feature}
                              variant="secondary"
                              className="bg-orange-400/10 text-orange-400"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Feedback Content */}
                      <div className="space-y-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-1">
                            Favorite Feature
                          </h4>
                          <p className="text-zinc-400">
                            {feedback.favoriteFeature || "No response"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-1">
                            Difficult Aspects
                          </h4>
                          <p className="text-zinc-400">
                            {feedback.difficultAspect || "No response"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-1">
                            Suggestions
                          </h4>
                          <p className="text-zinc-400">
                            {feedback.suggestions || "No response"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
