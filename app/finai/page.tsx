"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CategoryBreakdownTable } from "@/components/component/category-breakdown-table";

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Analysis Dashboard</h1>

      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* AI Analysis Results */}
      {finaiData?.aiAnalysis && !loading && (
        <div className="grid gap-6 mb-8">
          {/* AI Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Analysis Summary</h2>
            <p className="text-gray-600 mb-4">
              {finaiData.aiAnalysis.report.summary}
            </p>
          </Card>

          {/* Key Insights */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <div className="grid gap-4">
              {finaiData.aiAnalysis.report.insights.map((insight, index) => (
                <div
                  key={index}
                  className="border-l-4 pl-4"
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
                    className={`font-semibold ${getInsightColor(insight.type)}`}
                  >
                    {insight.title}
                  </h3>
                  <p className="text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
            <div className="grid gap-4">
              {finaiData.aiAnalysis.report.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${getPriorityColor(
                    rec.priority
                  )}`}
                >
                  <h3 className="font-semibold">
                    {rec.priority === "high" && "🔥 "}
                    {rec.priority === "medium" && "⚡ "}
                    {rec.priority === "low" && "💡 "}
                    {rec.title}
                  </h3>
                  <p className="text-gray-600">{rec.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* General Tips */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Financial Tips</h2>
            <ul className="list-disc list-inside space-y-2">
              {finaiData.aiAnalysis.report.general_tips.map((tip, index) => (
                <li key={index} className="text-gray-600">
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Category Breakdown Table Component */}
      <div className="mb-8">
        <CategoryBreakdownTable />
      </div>
      
      {/* AI Model Indicator */}
      <div className="text-center text-sm text-gray-500 mt-4">
        <p>
          {loading ? "Loading AI..." : 
           error ? "AI failed to load" : 
           finaiData ? "Powered by Groq LLM (llama3-70b)" : "AI not available"}
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
    </div>
  );
}
