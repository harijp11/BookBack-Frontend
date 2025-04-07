"use client"

import type React from "react"
import { BookOpen, Clock, DollarSign, Users, Search, Bell } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ElementType
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white text-black rounded-lg shadow p-4">
    <div className="flex items-center justify-between pb-2">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <Icon className="w-4 h-4 text-gray-600" />
    </div>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-gray-600">{change}</p>
  </div>
)

interface RentalItem {
  id: string
  user: string
  book: string
  date: string
  status: "Active" | "Overdue" | "Returned"
}

const recentRentals: RentalItem[] = [
  { id: "RNT-1234", user: "John Doe", book: "The Great Gatsby", date: "2024-03-25", status: "Active" },
  { id: "RNT-1235", user: "Jane Smith", book: "To Kill a Mockingbird", date: "2024-03-24", status: "Active" },
  { id: "RNT-1236", user: "Robert Johnson", book: "1984", date: "2024-03-23", status: "Overdue" },
  { id: "RNT-1237", user: "Emily Davis", book: "Pride and Prejudice", date: "2024-03-22", status: "Returned" },
  { id: "RNT-1238", user: "Michael Wilson", book: "The Hobbit", date: "2024-03-21", status: "Active" },
]

interface DashboardProps {
  onSearch?: (query: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onSearch }) => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("search") as string
    if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-300 bg-white px-6">
        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <form className="flex-1 md:max-w-sm" onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="search"
                name="search"
                placeholder="Search books, users..."
                className="w-full rounded-md border border-gray-300 bg-white text-black pl-8 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative rounded-md border border-gray-300 p-2">
            <Bell className="h-4 w-4 text-black" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
              3
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Books" value="1,248" change="+12 added this month" icon={BookOpen} />
          <StatCard title="Active Rentals" value="342" change="+8% from last week" icon={Clock} />
          <StatCard title="Total Revenue" value="$12,234" change="+16% from last month" icon={DollarSign} />
          <StatCard title="Active Users" value="573" change="+32 this week" icon={Users} />
        </div>

        {/* Recent Rentals */}
        <div className="bg-gray-100 rounded-lg shadow">
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold">Recent Rentals</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-black">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-700 border-b border-gray-300">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Book</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRentals.map((rental) => (
                  <tr key={rental.id} className="border-b border-gray-300">
                    <td className="py-3">{rental.id}</td>
                    <td className="py-3">{rental.user}</td>
                    <td className="py-3">{rental.book}</td>
                    <td className="py-3">{rental.date}</td>
                    <td className={`py-3 ${rental.status === "Active" ? "text-green-600" : rental.status === "Overdue" ? "text-red-600" : "text-gray-600"}`}>{rental.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
