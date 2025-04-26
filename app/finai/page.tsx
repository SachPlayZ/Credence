"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CategoryBreakdownTable } from "@/components/component/category-breakdown-table";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";

interface AIReport {
  summary: string;
  insights: {
    title: string;
    description: string;
    type: "positive" | "warning" | "negative";
  }[];
  recommendations: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  overspending_categories: {
    category: string;
    overspent_by: number;
  }[];
  actionable_advice: string[];
  general_tips: string[];
}

interface AnalysisResponse {
  analysis: any;
  report: AIReport;
}

interface FinAIResponse {
  categoryBreakdown: {
    breakdown: any[];
    totals: {
      budgeted: number;
      spent: number;
      remaining: number;
    };
    month: number;
    year: number;
  };
  aiAnalysis: AnalysisResponse;
}

export default function FinancialAnalysisPage() {
  const [finaiData, setFinaiData] = useState<FinAIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/ai/finai");
        if (!response.ok) {
          throw new Error("Failed to fetch financial analysis");
        }
        const data = await response.json();
        setFinaiData(data);
        setError("");
      } catch (e) {
        console.error("Error fetching financial data:", e);
        setError("Failed to fetch financial data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 -z-5 bg-[url('/grid.svg')] bg-center opacity-10" />

      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500"
        >
          AI-Powered Financial Analysis
        </motion.h1>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center min-h-[200px]"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* AI Analysis Results */}
        {finaiData?.aiAnalysis && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 mb-8"
          >
            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              className="transition-all"
            >
              <Card className="p-6 glassmorphism border-orange-500/30 orange-glow">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  AI Analysis Summary
                </h2>
                <p className="text-gray-300 mb-4">
                  {finaiData.aiAnalysis.report.summary}
                </p>
              </Card>
            </motion.div>

            {/* Key Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              className="transition-all"
            >
              <Card className="p-6 glassmorphism border-orange-500/30 orange-glow">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Key Insights
                </h2>
                <div className="grid gap-4">
                  {finaiData.aiAnalysis.report.insights.map(
                    (insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-l-4 pl-4 hover:pl-6 transition-all"
                        style={{
                          borderColor:
                            insight.type === "positive"
                              ? "#10B981"
                              : insight.type === "warning"
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      >
                        <h3
                          className={`font-semibold ${getInsightColor(
                            insight.type
                          )}`}
                        >
                          {insight.title}
                        </h3>
                        <p className="text-gray-300">{insight.description}</p>
                      </motion.div>
                    )
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.01 }}
              className="transition-all"
            >
              <Card className="p-6 glassmorphism border-orange-500/30 orange-glow">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Recommendations
                </h2>
                <div className="grid gap-4">
                  {finaiData.aiAnalysis.report.recommendations.map(
                    (rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 border rounded-lg glassmorphism hover:border-orange-500/30 transition-all ${
                          rec.priority === "high"
                            ? "border-red-500/30 bg-red-500/10"
                            : rec.priority === "medium"
                            ? "border-yellow-500/30 bg-yellow-500/10"
                            : "border-green-500/30 bg-green-500/10"
                        }`}
                      >
                        <h3 className="font-semibold text-white">
                          {rec.priority === "high" && "🔥 "}
                          {rec.priority === "medium" && "⚡ "}
                          {rec.priority === "low" && "💡 "}
                          {rec.title}
                        </h3>
                        <p className="text-gray-300">{rec.description}</p>
                      </motion.div>
                    )
                  )}
                </div>
              </Card>
            </motion.div>

            {/* General Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="transition-all"
            >
              <Card className="p-6 glassmorphism border-orange-500/30 orange-glow">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Financial Tips
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {finaiData.aiAnalysis.report.general_tips.map(
                    (tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {tip}
                      </motion.li>
                    )
                  )}
                </ul>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Category Breakdown Table Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card className="glassmorphism border-orange-500/30 orange-glow">
            <CategoryBreakdownTable />
          </Card>
        </motion.div>
      </div>

      {/* AI Model Indicator */}
      <div className="text-center text-sm text-gray-500 mt-4">
        <p>
          {loading
            ? "Loading AI..."
            : error
            ? "AI failed to load"
            : finaiData
            ? "Powered by Groq LLM (llama3-70b) • Currency: ₹ Indian Rupee"
            : "AI not available"}
        </p>
        {finaiData?.aiAnalysis && (
          <div className="mt-2 p-2 bg-gray-100 rounded inline-block">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              AI Analysis Complete
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
