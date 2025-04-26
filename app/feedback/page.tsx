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
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              rating <= value
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  // Check if user has already submitted feedback
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const response = await fetch("/api/feedback");
        const data = await response.json();

        if (data.hasSubmitted) {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error checking feedback status:", error);
      }
    };

    checkFeedbackStatus();
  }, [router]);

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
        throw new Error("Failed to submit feedback");
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace("/");
  };

  return (
    <main className="min-h-screen overflow-x-hidden relative">
      {/* Grid overlay - Moved behind content */}
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />

      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500"
        >
          Help Us Improve
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Rating Questions Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Rating Questions
                </h2>

                <FormField
                  control={form.control}
                  name="easeOfLogging"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ease of logging expenses</FormLabel>
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
                    <FormItem>
                      <FormLabel>
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
                    <FormItem>
                      <FormLabel>Satisfaction with reminders/alerts</FormLabel>
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
                    <FormItem>
                      <FormLabel>Likelihood of recommending the app</FormLabel>
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
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Multiple Choice Questions
                </h2>

                <FormField
                  control={form.control}
                  name="mostUsedFeatures"
                  render={() => (
                    <FormItem>
                      <FormLabel>Features you use most often</FormLabel>
                      <div className="space-y-2">
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
                              <FormItem className="flex items-center space-x-3">
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
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
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
                    <FormItem>
                      <FormLabel>Improvements you&apos;d like to see</FormLabel>
                      <div className="space-y-2">
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
                              <FormItem className="flex items-center space-x-3">
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
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
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
                    <FormItem>
                      <FormLabel>Motivation for using the app</FormLabel>
                      <div className="space-y-2">
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
                              <FormItem className="flex items-center space-x-3">
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
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
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
                    <FormItem>
                      <FormLabel>Most helpful notifications</FormLabel>
                      <div className="space-y-2">
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
                              <FormItem className="flex items-center space-x-3">
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
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
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
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Single Choice Questions
                </h2>

                <FormField
                  control={form.control}
                  name="usageFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select usage frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="multiple_daily">
                            Multiple times a day
                          </SelectItem>
                          <SelectItem value="once_daily">Once a day</SelectItem>
                          <SelectItem value="few_weekly">
                            Few times a week
                          </SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discoverySource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How you heard about the app</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discovery source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                    <FormItem>
                      <FormLabel>
                        Budgeting skill level before using the app
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                    <FormItem>
                      <FormLabel>Preferred budget type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Open-ended Questions
                </h2>

                <FormField
                  control={form.control}
                  name="favoriteFeature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What is your favorite feature and why?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your favorite feature..."
                          className="min-h-[100px]"
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
                    <FormItem>
                      <FormLabel>
                        What did you find difficult or confusing?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share any difficulties you encountered..."
                          className="min-h-[100px]"
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
                    <FormItem>
                      <FormLabel>
                        Do you have any suggestions for improvements?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your suggestions..."
                          className="min-h-[100px]"
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
              >
                <Button
                  type="submit"
                  className="w-full orange-gradient orange-glow"
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
