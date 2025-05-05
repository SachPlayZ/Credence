"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
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
import { Star, StarHalf } from "lucide-react";

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

const formatLabel = (label: string) => {
  return label
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className="w-6 h-6 fill-orange-400 text-orange-400"
      />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <StarHalf
        key="half"
        className="w-6 h-6 fill-orange-400 text-orange-400"
      />
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-6 h-6 text-zinc-600" />);
  }

  return <div className="flex gap-1">{stars}</div>;
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

  const questionData = [
    {
      title: "Usage Frequency",
      data: Object.entries(data.usageFrequency).map(([key, value]) => ({
        name: formatLabel(key),
        value,
      })),
    },
    {
      title: "Discovery Source",
      data: Object.entries(data.discoverySource).map(([key, value]) => ({
        name: formatLabel(key),
        value,
      })),
    },
    {
      title: "Prior Budgeting Skill",
      data: Object.entries(data.priorBudgetingSkill).map(([key, value]) => ({
        name: formatLabel(key),
        value,
      })),
    },
    {
      title: "Feature Usage",
      data: Object.entries(data.featureUsage).map(([key, value]) => ({
        name: formatLabel(key),
        value,
      })),
    },
    {
      title: "Desired Improvements",
      data: Object.entries(data.desiredImprovements).map(([key, value]) => ({
        name: formatLabel(key),
        value,
      })),
    },
  ];

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
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={value} />
                <p className="text-sm text-zinc-400">{value.toFixed(1)} / 5</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Question-wise Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {questionData.map((question, index) => (
          <Card key={index} className="glassmorphism">
            <CardHeader>
              <CardTitle>{question.title}</CardTitle>
              <CardDescription>Response distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={question.data}
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
                  <Bar
                    dataKey="value"
                    fill={COLORS.primary[index % COLORS.primary.length]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Member Feedback List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Open-ended Feedback</CardTitle>
            <CardDescription>Anonymous feedback from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.memberFeedback.map((feedback, index) => (
                <div
                  key={index}
                  className="border-b border-zinc-800 last:border-0 pb-8 last:pb-0"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Feedback Content */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
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
