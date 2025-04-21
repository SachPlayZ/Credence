import { ObjectId } from "mongodb";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export interface Transaction {
  _id?: ObjectId;
  userId: ObjectId;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Budget {
  _id?: ObjectId;
  userId: ObjectId;
  month: number;
  year: number;
  totalBudget: number;
  allocations: {
    category: string;
    amount: number;
  }[];
  unallocated: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalPercentage: number;
  categories: BudgetStatus[];
}

export interface Balance {
  _id?: ObjectId;
  userId: ObjectId;
  currentBalance: number;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
