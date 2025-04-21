"use client"
import { motion } from "framer-motion"

import { StatsCards } from "@/components/component/stats-cards"
import { ExpensePieChart } from "@/components/component/expense-pie-chart"
import { MonthlyBarChart } from "@/components/component/monthly-bar-chart"
import { BalanceTrendChart } from "@/components/component/balance-trend-chart"
import { CategoryBreakdownTable } from "@/components/component/category-breakdown-table"
import { DateRangeFilter } from "@/components/component/date-range-filter"
import Navbar from "@/components/navbar"

export default function Summary() {
  return (
    <div className="space-y-6 py-12 px-10">
    <Navbar/>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <DateRangeFilter />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatsCards />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ExpensePieChart />
        <MonthlyBarChart />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <BalanceTrendChart />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CategoryBreakdownTable />
      </motion.div>
    </div>
  )
}
