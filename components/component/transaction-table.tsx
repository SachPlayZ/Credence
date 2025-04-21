"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

export function TransactionTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    type: "",
    amount: "",
    category: "",
    description: "",
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let url = "/api/finance/transaction";
      const queryParams = new URLSearchParams();

      if (categoryFilter !== "all")
        queryParams.append("category", categoryFilter);
      if (typeFilter !== "all") queryParams.append("type", typeFilter);

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [categoryFilter, typeFilter]);

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/finance/transaction?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      toast.success("Transaction deleted successfully");
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction?._id) return;

    try {
      const response = await fetch(`/api/finance/transaction`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTransaction._id,
          ...editFormData,
          amount: parseFloat(editFormData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      toast.success("Transaction updated successfully");
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTransactionDate = (date: Date | string) => {
    const transactionDate = new Date(date);

    if (isToday(transactionDate)) {
      return "Today";
    }

    if (isYesterday(transactionDate)) {
      return "Yesterday";
    }

    // For dates within the last 30 days, show relative time
    const daysAgo = formatDistanceToNow(transactionDate, { addSuffix: true });
    if (transactionDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      return daysAgo;
    }

    // For older dates, show the actual date
    return format(transactionDate, "MMM d, yyyy");
  };

  return (
    <Card className="glassmorphism rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
        <CardDescription className="text-zinc-400">
          View and manage your recent financial activities
        </CardDescription>
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
                <TableHead className="text-zinc-300 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction._id?.toString()}
                    className="bg-zinc-800/10"
                  >
                    <TableCell className="font-medium">
                      {formatTransactionDate(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.type === "income" ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={
                            transaction.type === "income"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {transaction.type.charAt(0).toUpperCase() +
                            transaction.type.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      ₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(transaction)}
                          className="h-8 w-8"
                        >
                          <EditIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteTransaction(
                              transaction._id?.toString() || ""
                            )
                          }
                          className="h-8 w-8 text-red-500 hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add the edit dialog */}
        <Dialog
          open={!!editingTransaction}
          onOpenChange={() => setEditingTransaction(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Make changes to your transaction here. Click save when
                you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editFormData.type}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, type: value })
                    }
                  >
                    <SelectTrigger
                      id="edit-type"
                      className="bg-zinc-800/50 border-zinc-700"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        amount: e.target.value,
                      })
                    }
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, category: value })
                  }
                >
                  <SelectTrigger
                    id="edit-category"
                    className="bg-zinc-800/50 border-zinc-700"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="transportation">
                      Transportation
                    </SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingTransaction(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="orange-gradient">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
