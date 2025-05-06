"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePDF } from "react-to-pdf";
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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

interface QuestionData {
  title: string;
  data: Array<{
    name: string;
    value: number;
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

const PDFContent = ({ data }: { data: FeedbackAnalysis }) => {
  const questionData: QuestionData[] = [
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

  // Filter out feedback with no responses
  const filteredFeedback = data.memberFeedback.filter(
    (feedback) =>
      feedback.favoriteFeature ||
      feedback.difficultAspect ||
      feedback.suggestions
  );

  return (
    <div className="p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Feedback Analysis Report
      </h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overall Ratings</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.ratingAverages).map(([key, value]) => (
            <div key={key} className="border p-4 rounded">
              <h3 className="font-medium mb-2">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </h3>
              <div className="flex items-center gap-2">
                <StarRating rating={value} />
                <span className="text-sm">{value.toFixed(1)} / 5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Response Analysis</h2>
        <div className="space-y-8">
          {questionData.map((question, index) => (
            <div
              key={index}
              className="border p-4 rounded"
              style={{
                pageBreakInside: "avoid",
                marginBottom:
                  question.title === "Discovery Source" ? "112px" : "0",
              }}
            >
              <h3 className="font-medium mb-4">{question.title}</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={question.data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Bar
                      dataKey="value"
                      fill={COLORS.primary[index % COLORS.primary.length]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Open-ended Feedback</h2>
        <div className="space-y-6">
          {filteredFeedback.map((feedback, index) => (
            <div
              key={index}
              className="border p-4 rounded"
              style={{
                pageBreakInside: "avoid",
                breakInside: "avoid",
                marginBottom: "24px",
              }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {feedback.mostUsedFeatures?.map((feature: string) => (
                  <span
                    key={feature}
                    className="bg-gray-100 px-2 py-1 rounded text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                {feedback.favoriteFeature && (
                  <div style={{ pageBreakInside: "avoid" }}>
                    <h4 className="font-medium mb-1">Favorite Feature</h4>
                    <p className="text-gray-700">{feedback.favoriteFeature}</p>
                  </div>
                )}

                {feedback.difficultAspect && (
                  <div style={{ pageBreakInside: "avoid" }}>
                    <h4 className="font-medium mb-1">Difficult Aspects</h4>
                    <p className="text-gray-700">{feedback.difficultAspect}</p>
                  </div>
                )}

                {feedback.suggestions && (
                  <div style={{ pageBreakInside: "avoid" }}>
                    <h4 className="font-medium mb-1">Suggestions</h4>
                    <p className="text-gray-700">{feedback.suggestions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function FeedbackAnalysis() {
  const [data, setData] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({
    filename: "feedback-analysis.pdf",
    page: {
      format: "a4",
      orientation: "portrait",
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    method: "save",
  });

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

  const questionData: QuestionData[] = [
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

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => toPDF()}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div
        ref={targetRef}
        className="fixed left-[-9999px] top-0 w-[210mm] bg-white"
        style={{ minHeight: "297mm" }}
      >
        {data && <PDFContent data={data} />}
      </div>

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

        {data &&
          Object.entries(data.ratingAverages).map(([key, value]) => (
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
                  <p className="text-sm text-zinc-400">
                    {value.toFixed(1)} / 5
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
      </motion.div>

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
              {data?.memberFeedback
                .filter(
                  (feedback) =>
                    feedback.favoriteFeature ||
                    feedback.difficultAspect ||
                    feedback.suggestions
                )
                .map((feedback, index) => (
                  <div
                    key={index}
                    className="border-b border-zinc-800 last:border-0 pb-8 last:pb-0"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-wrap gap-2">
                            {feedback.mostUsedFeatures?.map(
                              (feature: string) => (
                                <Badge
                                  key={feature}
                                  variant="secondary"
                                  className="bg-orange-400/10 text-orange-400"
                                >
                                  {feature}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 mt-4">
                          {feedback.favoriteFeature && (
                            <div>
                              <h4 className="text-sm font-medium text-zinc-300 mb-1">
                                Favorite Feature
                              </h4>
                              <p className="text-zinc-400">
                                {feedback.favoriteFeature}
                              </p>
                            </div>
                          )}

                          {feedback.difficultAspect && (
                            <div>
                              <h4 className="text-sm font-medium text-zinc-300 mb-1">
                                Difficult Aspects
                              </h4>
                              <p className="text-zinc-400">
                                {feedback.difficultAspect}
                              </p>
                            </div>
                          )}

                          {feedback.suggestions && (
                            <div>
                              <h4 className="text-sm font-medium text-zinc-300 mb-1">
                                Suggestions
                              </h4>
                              <p className="text-zinc-400">
                                {feedback.suggestions}
                              </p>
                            </div>
                          )}
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
