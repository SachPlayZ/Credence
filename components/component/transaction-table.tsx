"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, EditIcon, SearchIcon, TrashIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample transaction data
const transactions = [
  {
    id: 1,
    date: "2023-04-15",
    type: "expense",
    amount: 42.5,
    category: "Food & Dining",
    description: "Grocery shopping",
  },
  {
    id: 2,
    date: "2023-04-14",
    type: "expense",
    amount: 9.99,
    category: "Entertainment",
    description: "Streaming subscription",
  },
  {
    id: 3,
    date: "2023-04-13",
    type: "income",
    amount: 2500.0,
    category: "Income",
    description: "Salary deposit",
  },
  {
    id: 4,
    date: "2023-04-10",
    type: "expense",
    amount: 35.0,
    category: "Transportation",
    description: "Gas",
  },
  {
    id: 5,
    date: "2023-04-08",
    type: "expense",
    amount: 120.75,
    category: "Shopping",
    description: "New clothes",
  },
  {
    id: 6,
    date: "2023-04-05",
    type: "expense",
    amount: 65.3,
    category: "Utilities",
    description: "Electricity bill",
  },
  {
    id: 7,
    date: "2023-04-01",
    type: "income",
    amount: 150.0,
    category: "Income",
    description: "Freelance work",
  },
]

export function TransactionTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || transaction.category.toLowerCase().includes(categoryFilter.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter

    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
        <CardDescription className="text-zinc-400">View and manage your recent financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-800/50"
            />
          </div>
          <div className="w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-800/50">
              <TableRow>
                <TableHead className="text-zinc-300">Date</TableHead>
                <TableHead className="text-zinc-300">Type</TableHead>
                <TableHead className="text-zinc-300">Amount</TableHead>
                <TableHead className="text-zinc-300">Category</TableHead>
                <TableHead className="text-zinc-300">Description</TableHead>
                <TableHead className="text-zinc-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => (
                <TableRow key={transaction.id} className={index % 2 === 0 ? "bg-zinc-800/20" : "bg-zinc-800/10"}>
                  <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {transaction.type === "income" ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
