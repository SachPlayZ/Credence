"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AddTransactionForm } from "@/components/component/add-transaction-form";
import { BalanceCard } from "@/components/component/balance-card";
import { TransactionTable } from "@/components/component/transaction-table";
import { BudgetStatusOverview } from "@/components/component/budget-status-overview";
import { BudgetPlannerCard } from "@/components/component/budget-planner-card";
import Navbar from "@/components/navbar";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6 py-12 px-10 mx-8 my-8">
      <Navbar />
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Column - User Input */}
        <div className="space-y-6">
          <AddTransactionForm onTransactionAdded={handleTransactionAdded} />
          <BudgetPlannerCard />
        </div>

        {/* Right Column - Live Overviews */}
        <div className="space-y-6">
          <BalanceCard key={`balance-${refreshKey}`} />
          <BudgetStatusOverview key={`budget-${refreshKey}`} />
        </div>
      </motion.div>

      {/* Full-width Transaction Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TransactionTable key={`transactions-${refreshKey}`} />
      </motion.div>
    </div>
  );
}
