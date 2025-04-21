import { Transaction } from "@/app/types";

interface TransactionAmountProps {
  transaction: Transaction;
}

export function TransactionAmount({ transaction }: TransactionAmountProps) {
  return (
    <div
      className={`text-sm font-medium ${
        transaction.type === "income" ? "text-green-500" : "text-red-500"
      }`}
    >
      {transaction.type === "income" ? "+" : "-"}₹
      {transaction.amount.toFixed(2)}
    </div>
  );
}
