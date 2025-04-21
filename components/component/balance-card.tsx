"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BalanceCard() {
  const [balance, setBalance] = useState(0)
  const [targetBalance] = useState(2547.63)
  const [isPositive, setIsPositive] = useState(true)

  // Animate the balance counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (balance < targetBalance) {
        setBalance((prev) => {
          const newBalance = prev + (targetBalance - prev) * 0.1
          return Math.min(newBalance, targetBalance)
        })
      } else {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [balance, targetBalance])

  useEffect(() => {
    setIsPositive(targetBalance >= 0)
  }, [targetBalance])

  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Current Balance</CardTitle>
        <CardDescription className="text-zinc-400">Last updated on {new Date().toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[180px]">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <ArrowUpIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-6 w-6 text-red-500" />
            )}
            <span className={`text-4xl font-bold animate-count-up ${isPositive ? "text-green-500" : "text-red-500"}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-500">
              <ArrowUpIcon className="h-4 w-4" />
              <span className="text-sm">$3,240.50</span>
            </div>
            <span className="text-zinc-500">|</span>
            <div className="flex items-center gap-1 text-red-500">
              <ArrowDownIcon className="h-4 w-4" />
              <span className="text-sm">$692.87</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
