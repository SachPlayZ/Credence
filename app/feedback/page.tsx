"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { SuccessModal } from "@/components/ui/success-modal";
import { useToast } from "@/components/ui/use-toast";

// Form schema
const formSchema = z.object({
  // Rating questions
  easeOfLogging: z.number().min(1).max(5),
  budgetEffectiveness: z.number().min(1).max(5),
  reminderSatisfaction: z.number().min(1).max(5),
  recommendationLikelihood: z.number().min(1).max(5),

  // Multiple choice questions
  mostUsedFeatures: z.array(z.string()).min(1),
  desiredImprovements: z.array(z.string()).min(1),
  motivations: z.array(z.string()).min(1),
  helpfulNotifications: z.array(z.string()).min(1),

  // Single choice questions
  usageFrequency: z.string(),
  discoverySource: z.string(),
  priorBudgetingSkill: z.string(),
  preferredBudgetType: z.string(),

  // Open-ended questions
  favoriteFeature: z.string(),
  difficultAspect: z.string(),
  suggestions: z.string(),
});

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="focus:outline-none transform hover:scale-110 transition-transform duration-200"
        >
          <Star
            className={`w-7 h-7 ${
              rating <= value
                ? "text-orange-400 fill-orange-400"
                : "text-zinc-700 hover:text-zinc-600"
            } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  );
};

// Add this CSS class to style form items
const formItemClass =
  "relative p-6 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-orange-500/10 shadow-lg hover:shadow-orange-500/5 transition-all duration-300 backdrop-blur-sm";
const formLabelClass = "text-lg font-medium text-zinc-200 mb-4 block";

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user has already submitted feedback
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        setIsCheckingStatus(true);
        const response = await fetch("/api/feedback");

        if (!response.ok) {
          const data = await response.json();
          // If not authenticated, redirect to login
          if (response.status === 401) {
            router.replace("/auth/signin");
            return;
          }
          throw new Error(data.error || "Failed to check feedback status");
        }

        const data = await response.json();

        if (data.hasSubmitted) {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error checking feedback status:", error);
        toast({
          title: "Error",
          description:
            "Failed to check feedback status. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFeedbackStatus();
  }, [router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      easeOfLogging: 0,
      budgetEffectiveness: 0,
      reminderSatisfaction: 0,
      recommendationLikelihood: 0,
      mostUsedFeatures: [],
      desiredImprovements: [],
      motivations: [],
      helpfulNotifications: [],
      usageFrequency: "",
      discoverySource: "",
      priorBudgetingSkill: "",
      preferredBudgetType: "",
      favoriteFeature: "",
      difficultAspect: "",
      suggestions: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/");
  };

  // Show loading state while checking feedback status
  if (isCheckingStatus) {
    return (
      <main className="min-h-screen overflow-x-hidden relative bg-zinc-900">
        <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <p className="text-zinc-400">Checking feedback status...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden relative bg-zinc-900">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />

      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
            Help Us Improve
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Rating Questions Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 space-y-6 shadow-lg hover:shadow-orange-500/10 transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Rating Questions
                  </h2>
                </div>

                <FormField
                  control={form.control}
                  name="easeOfLogging"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Ease of logging expenses
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetEffectiveness"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Effectiveness at helping stay within budget
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderSatisfaction"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Satisfaction with reminders/alerts
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recommendationLikelihood"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Likelihood of recommending the app
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Multiple Choice Questions Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 space-y-6 shadow-lg hover:shadow-orange-500/10 transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Multiple Choice Questions
                  </h2>
                </div>

                <FormField
                  control={form.control}
                  name="mostUsedFeatures"
                  render={() => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Features you use most often
                      </FormLabel>
                      <div className="space-y-3 pl-2">
                        {[
                          "Expense Logging",
                          "Budget Setting",
                          "Spending Alerts",
                          "Financial Reports",
                          "Goal Tracking",
                        ].map((feature) => (
                          <FormField
                            key={feature}
                            control={form.control}
                            name="mostUsedFeatures"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 hover:bg-orange-500/5 p-2 rounded-lg transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, feature]
                                        : field.value?.filter(
                                            (value) => value !== feature
                                          );
                                      field.onChange(newValue);
                                    }}
                                    className="border-orange-500/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-zinc-300 cursor-pointer">
                                  {feature}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="desiredImprovements"
                  render={() => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Improvements you&apos;d like to see
                      </FormLabel>
                      <div className="space-y-3 pl-2">
                        {[
                          "Personalized budget advice",
                          "Better visual analytics",
                          "Bank account integration",
                          "Dark mode",
                          "Other",
                        ].map((improvement) => (
                          <FormField
                            key={improvement}
                            control={form.control}
                            name="desiredImprovements"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 hover:bg-orange-500/5 p-2 rounded-lg transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(improvement)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, improvement]
                                        : field.value?.filter(
                                            (value) => value !== improvement
                                          );
                                      field.onChange(newValue);
                                    }}
                                    className="border-orange-500/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-zinc-300 cursor-pointer">
                                  {improvement}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motivations"
                  render={() => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Motivation for using the app
                      </FormLabel>
                      <div className="space-y-3 pl-2">
                        {[
                          "Save for goals",
                          "Avoid debt",
                          "Build habits",
                          "Track spending awareness",
                          "Other",
                        ].map((motivation) => (
                          <FormField
                            key={motivation}
                            control={form.control}
                            name="motivations"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 hover:bg-orange-500/5 p-2 rounded-lg transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(motivation)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, motivation]
                                        : field.value?.filter(
                                            (value) => value !== motivation
                                          );
                                      field.onChange(newValue);
                                    }}
                                    className="border-orange-500/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-zinc-300 cursor-pointer">
                                  {motivation}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="helpfulNotifications"
                  render={() => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Most helpful notifications
                      </FormLabel>
                      <div className="space-y-3 pl-2">
                        {[
                          "Daily spending summary",
                          "Budget limit warnings",
                          "Weekly financial health check",
                          "Custom savings tips",
                        ].map((notification) => (
                          <FormField
                            key={notification}
                            control={form.control}
                            name="helpfulNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 hover:bg-orange-500/5 p-2 rounded-lg transition-colors">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      notification
                                    )}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, notification]
                                        : field.value?.filter(
                                            (value) => value !== notification
                                          );
                                      field.onChange(newValue);
                                    }}
                                    className="border-orange-500/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 mt-1"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-zinc-300 cursor-pointer">
                                  {notification}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Single Choice Questions Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 space-y-6 shadow-lg hover:shadow-orange-500/10 transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Single Choice Questions
                  </h2>
                </div>

                <FormField
                  control={form.control}
                  name="usageFrequency"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Usage frequency
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                            <SelectValue placeholder="Select usage frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-orange-500/20">
                          <SelectItem
                            value="multiple_daily"
                            className="hover:bg-orange-500/10 cursor-pointer"
                          >
                            Multiple times a day
                          </SelectItem>
                          <SelectItem
                            value="once_daily"
                            className="hover:bg-orange-500/10 cursor-pointer"
                          >
                            Once a day
                          </SelectItem>
                          <SelectItem
                            value="few_weekly"
                            className="hover:bg-orange-500/10 cursor-pointer"
                          >
                            Few times a week
                          </SelectItem>
                          <SelectItem
                            value="rarely"
                            className="hover:bg-orange-500/10 cursor-pointer"
                          >
                            Rarely
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discoverySource"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        How you heard about the app
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                            <SelectValue placeholder="Select discovery source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-orange-500/20">
                          <SelectItem value="friend_family">
                            Friend/Family
                          </SelectItem>
                          <SelectItem value="social_media">
                            Social Media
                          </SelectItem>
                          <SelectItem value="app_store">
                            App Store Search
                          </SelectItem>
                          <SelectItem value="online_articles">
                            Online Articles
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priorBudgetingSkill"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Budgeting skill level before using the app
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-orange-500/20">
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredBudgetType"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Preferred budget type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                            <SelectValue placeholder="Select budget type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-orange-500/20">
                          <SelectItem value="monthly">
                            Monthly budgets
                          </SelectItem>
                          <SelectItem value="weekly">Weekly budgets</SelectItem>
                          <SelectItem value="custom">
                            Custom period budgets
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Open-ended Questions Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-zinc-900/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 space-y-6 shadow-lg hover:shadow-orange-500/10 transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                  <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Open-ended Questions
                  </h2>
                </div>

                <FormField
                  control={form.control}
                  name="favoriteFeature"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        What is your favorite feature and why?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your favorite feature..."
                          className="min-h-[100px] bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors focus:border-orange-500/60 focus:ring-orange-500/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficultAspect"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        What did you find difficult or confusing?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share any difficulties you encountered..."
                          className="min-h-[100px] bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors focus:border-orange-500/60 focus:ring-orange-500/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="suggestions"
                  render={({ field }) => (
                    <FormItem className={formItemClass}>
                      <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                      <FormLabel className={formLabelClass}>
                        Do you have any suggestions for improvements?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your suggestions..."
                          className="min-h-[100px] bg-zinc-800/50 border-orange-500/20 hover:border-orange-500/40 transition-colors focus:border-orange-500/60 focus:ring-orange-500/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="pt-6"
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 transition-all duration-300 rounded-xl shadow-lg hover:shadow-orange-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Feedback"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />
    </main>
  );
}
