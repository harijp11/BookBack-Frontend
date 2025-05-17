// src/components/Dashboard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useDashboardData } from "@/hooks/admin/dashboardHooks/useFetchDashboardQueries"; 


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// TypeScript Interfaces (unchanged from provided code)
interface DataPoint {
  sale: number;
  rental: number;
  saleCount: number;
  rentalCount: number;
}

interface SalesData {
  daily: Array<{ day: string } & DataPoint>;
  monthly: Array<{ month: string } & DataPoint>;
  weekly: Array<{ week: string } & DataPoint>;
  yearly: Array<{ year: string } & DataPoint>;
}

interface User {
  id: number;
  name: string;
  transactions: number;
  amount: number;
}

interface Category {
  id: number;
  name: string;
  sales: number;
  amount: number;
}

// Stat Card Component (unchanged)
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
);

// SalesChart Component (modified to use view state externally)
interface ChartProps {
  data: SalesData;
  view: "daily" | "weekly" | "monthly" | "yearly";
  setView: React.Dispatch<React.SetStateAction<"daily" | "weekly" | "monthly" | "yearly">>;
}

const SalesChart: React.FC<ChartProps> = ({ data, view, setView }) => {
  const currentData = data[view];
  const getLabel = (item: { day?: string; month?: string; week?: string; year?: string }): string => {
    return item.day || item.month || item.week || item.year || "";
  };
  const labels = currentData.map(getLabel);
  const saleData = currentData.map((item) => item.sale);
  const rentalData = currentData.map((item) => item.rental);
  const saleCountData = currentData.map((item) => item.saleCount);
  const rentalCountData = currentData.map((item) => item.rentalCount);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sale Amount ($)",
        data: saleData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
        counts: saleCountData,
      },
      {
        label: "Rental Amount ($)",
        data: rentalData,
        borderColor: "#d97706",
        backgroundColor: "rgba(217, 119, 6, 0.2)",
        fill: true,
        counts: rentalCountData,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y;
            return `${datasetLabel}: $${value}`;
          },
          footer: (tooltipItems: any[]) => {
            const tooltipItem = tooltipItems[0];
            const index = tooltipItem.dataIndex;
            const dataset = tooltipItem.dataset;
            const label = labels[index];
            const viewLabel = view.charAt(0).toUpperCase() + view.slice(1);
            const isSale = dataset.label === "Sale Amount ($)";

            if (isSale) {
              const saleAmount = saleData[index];
              const saleCount = saleCountData[index];
              return [
                `${viewLabel}: ${label}`,
                `Sale Amount: $${saleAmount}`,
                `Sale Count: ${saleCount}`,
              ];
            } else {
              const rentalAmount = rentalData[index];
              const rentalCount = rentalCountData[index];
              return [
                `${viewLabel}: ${label}`,
                `Rental Amount: $${rentalAmount}`,
                `Rental Count: ${rentalCount}`,
              ];
            }
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Amount ($)" } },
      x: { title: { display: true, text: view.charAt(0).toUpperCase() + view.slice(1) } },
    },
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sales & Rentals</h3>
        <div className="space-x-2">
          <button
            className={`px-3 py-1 rounded ${
              view === "daily" ? "bg-gray-800 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("daily")}
          >
            Daily
          </button>
          <button
            className={`px-3 py-1 rounded ${
              view === "monthly" ? "bg-gray-800 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-3 py-1 rounded ${
              view === "weekly" ? "bg-gray-800 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-3 py-1 rounded ${
              view === "yearly" ? "bg-gray-800 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="relative w-full h-[300px] md:h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

// Top Users Table (unchanged)
interface TopUsersProps {
  users: User[];
}

const TopUsers: React.FC<TopUsersProps> = ({ users }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Users</h3>
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2 text-gray-600">Name</th>
          <th className="py-2 text-gray-600">Transactions</th>
          {/* <th className="py-2 text-gray-600">Amount ($)</th> */}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b hover:bg-gray-50">
            <td className="py-2">{user.name}</td>
            <td className="py-2">{user.transactions}</td>
            {/* <td className="py-2">{user.amount}</td> */}
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);

// Top Categories Table (unchanged)
interface TopCategoriesProps {
  categories: Category[];
}

const TopCategories: React.FC<TopCategoriesProps> = ({ categories }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Categories</h3>
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2 text-gray-600">Category</th>
          <th className="py-2 text-gray-600">Sales</th>
          <th className="py-2 text-gray-600">Amount ($)</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id} className="border-b hover:bg-gray-50">
            <td className="py-2">{category.name}</td>
            <td className="py-2">{category.sales}</td>
            <td className="py-2">{category.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [view, setView] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const { data, isLoading, error } = useDashboardData({
    view,
    topLimit: "5",
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-red-600"
        >
          Error: {error.message}
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return null; // Fallback in case data is undefined
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <motion.h1
        className="text-3xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Sales" value={data.totalSales} icon="💰" />
        <StatCard title="Total Rentals" value={data.totalRentals} icon="📚" />
        <StatCard title="Total Users" value={data.totalUsers} icon="👥" />
      </div>
      <div className="mb-6">
        <SalesChart data={data.salesData} view={view} setView={setView} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopUsers users={data.topUsers} />
        <TopCategories categories={data.topCategories} />
      </div>
    </div>
  );
};

export default Dashboard;