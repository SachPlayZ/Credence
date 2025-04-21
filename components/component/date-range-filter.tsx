"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "./date-range-picker"
import { Card, CardContent } from "@/components/ui/card"

export function DateRangeFilter() {
  return (
    <Card className="glassmorphism rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto">
            <Label htmlFor="date-range" className="text-sm text-zinc-400">
              Date Range
            </Label>
            <DateRangePicker />
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="category" className="text-sm text-zinc-400">
              Category
            </Label>
            <Select defaultValue="all">
              <SelectTrigger id="category" className="w-full bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="type" className="text-sm text-zinc-400">
              Type
            </Label>
            <Select defaultValue="all">
              <SelectTrigger id="type" className="w-full bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="orange-gradient orange-glow transition-shadow">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}
