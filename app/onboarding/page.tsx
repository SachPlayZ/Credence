"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DollarSign, Briefcase, Target, ChevronRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    occupation: "",
    financialGoals: [] as string[],
    riskTolerance: "",
    existingInvestments: "",
    monthlyExpenses: "",
    savingsTarget: "",
  });

  const goals = [
    "Save for retirement",
    "Buy a house",
    "Build emergency fund",
    "Invest in stocks",
    "Pay off debt",
    "Start a business",
    "Save for education",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save onboarding data");

      await update(); // Update session with new data
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-xl font-semibold mb-4">Financial Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Monthly Income
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyIncome: e.target.value,
                      })
                    }
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="5000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Occupation
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="Software Engineer"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-xl font-semibold mb-4">Financial Goals</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <motion.button
                    key={goal}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      const updatedGoals = formData.financialGoals.includes(
                        goal
                      )
                        ? formData.financialGoals.filter((g) => g !== goal)
                        : [...formData.financialGoals, goal];
                      setFormData({
                        ...formData,
                        financialGoals: updatedGoals,
                      });
                    }}
                    className={`p-3 rounded-lg border text-left text-sm ${
                      formData.financialGoals.includes(goal)
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {goal}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-xl font-semibold mb-4">Investment Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Risk Tolerance
                </label>
                <select
                  value={formData.riskTolerance}
                  onChange={(e) =>
                    setFormData({ ...formData, riskTolerance: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50"
                  required
                >
                  <option value="">Select risk level</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Existing Investments
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    value={formData.existingInvestments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        existingInvestments: e.target.value,
                      })
                    }
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-xl font-semibold mb-4">Monthly Planning</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Average Monthly Expenses
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    value={formData.monthlyExpenses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyExpenses: e.target.value,
                      })
                    }
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="3000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Monthly Savings Target
                </label>
                <div className="relative">
                  <Target
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    value={formData.savingsTarget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        savingsTarget: e.target.value,
                      })
                    }
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500/50"
                    placeholder="1000"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#191923] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[10px] opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255, 99, 71, 0.1) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -inset-[10px] opacity-30"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, rgba(255, 140, 0, 0.1) 0%, transparent 50%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 relative z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
          Complete Your Profile
        </h2>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1/4 h-1 rounded-full ${
                  i <= step
                    ? "bg-gradient-to-r from-orange-400 to-red-500"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 rounded-lg border border-white/10 text-white"
              >
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 15px rgba(255, 99, 71, 0.7)",
              }}
              type={step === 4 ? "submit" : "button"}
              onClick={() => step < 4 && setStep(step + 1)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium ml-auto flex items-center gap-2"
            >
              {step === 4 ? "Complete" : "Next"}
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
