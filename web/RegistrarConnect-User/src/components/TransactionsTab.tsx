import React, { useState } from "react";

interface Transaction {
  id: number;
  type: string;
  description: string;
  status: "Ongoing Transaction" | "Failed Transaction" | "Successful Transaction";
  date: string;
}

export default function TransactionsTab() {
  const [transactions] = useState<Transaction[]>([
    { id: 1, type: "Tuition Payment", description: "Installment payment", status: "Successful Transaction", date: "2025-09-12" },
    { id: 2, type: "Transcript Copy", description: "Requested document", status: "Ongoing Transaction", date: "2025-09-11" },
  ]);

  const [timeFilter, setTimeFilter] = useState("Recent");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTransactions = transactions.filter((trans) => {
    const date = new Date(trans.date);
    const now = new Date();
    let isWithinTime = true;
    switch (timeFilter) {
      case "A week ago":
        isWithinTime = now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
        break;
      case "A month ago":
        isWithinTime = now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
        break;
      case "A year ago":
        isWithinTime = now.getTime() - date.getTime() <= 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        isWithinTime = true;
    }
    const matchesStatus = statusFilter === "All" || trans.status === statusFilter;
    return isWithinTime && matchesStatus;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Transactions</h1>
      <div className="flex gap-4 mb-6">
        <select
          className="p-2 border border-gray-300 rounded-lg"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="Recent">Recent</option>
          <option value="A week ago">A week ago</option>
          <option value="A month ago">A month ago</option>
          <option value="A year ago">A year ago</option>
        </select>
        <select
          className="p-2 border border-gray-300 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Ongoing Transaction">Ongoing Transaction</option>
          <option value="Failed Transaction">Failed Transaction</option>
          <option value="Successful Transaction">Successful Transaction</option>
        </select>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left text-gray-600 font-semibold">Type</th>
            <th className="p-3 text-left text-gray-600 font-semibold">Description</th>
            <th className="p-3 text-left text-gray-600 font-semibold">Status</th>
            <th className="p-3 text-left text-gray-600 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((trans) => (
            <tr key={trans.id} className="hover:bg-gray-50">
              <td className="p-3 border-b">{trans.type}</td>
              <td className="p-3 border-b">{trans.description}</td>
              <td className="p-3 border-b">{trans.status}</td>
              <td className="p-3 border-b">{trans.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}