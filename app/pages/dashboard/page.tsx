"use client"
import { motion } from "framer-motion"
import { AddTransactionForm } from "@/components/component/add-transaction-form"
import { BalanceCard } from "@/components/component/balance-card"
import { TransactionTable } from "@/components/component/transaction-table"
import { BudgetStatusOverview } from "@/components/component/budget-status-overview"
import { BudgetPlannerCard } from "@/components/component/budget-planner-card"
import Navbar from "@/components/navbar"

export default function DashboardPage() {
    return (
        <div className="space-y-6 py-12 px-10">
            <Navbar />
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Left Column - User Input */}
            <div className="space-y-6">
              <AddTransactionForm />
              <BudgetPlannerCard />
            </div>
    
            {/* Right Column - Live Overviews */}
            <div className="space-y-6">
              <BalanceCard />
              <BudgetStatusOverview />
            </div>
          </motion.div>
    
          {/* Full-width Transaction Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TransactionTable />
          </motion.div>
        </div>
      )
    }
    
