import { useGetDashboardStats, useGetEarnings } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  IndianRupee, MapPin, CalendarCheck, Star, Plus, TrendingUp, ArrowUpRight, Car
} from "lucide-react";

export default function HostDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: earnings, isLoading: earningsLoading } = useGetEarnings({ period: "week" });

  const chartData = earnings?.breakdown || [
    { period: "Mon", amount: 450 },
    { period: "Tue", amount: 300 },
    { period: "Wed", amount: 650 },
    { period: "Thu", amount: 400 },
    { period: "Fri", amount: 820 },
    { period: "Sat", amount: 1200 },
    { period: "Sun", amount: 950 },
  ];

  const statCards = [
    {
      title: "Total Earnings",
      value: `₹${stats?.totalEarnings?.toFixed(0) || "0"}`,
      icon: <IndianRupee className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      trend: "+12% this month",
      trendColor: "text-emerald-600",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings?.toString() || "0",
      icon: <CalendarCheck className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      trend: "+3 this week",
      trendColor: "text-blue-600",
    },
    {
      title: "Active Listings",
      value: stats?.activeListings?.toString() || "0",
      icon: <MapPin className="w-5 h-5 text-violet-600" />,
      bg: "bg-violet-50",
      border: "border-violet-100",
      iconBg: "bg-violet-100",
      trend: "All verified",
      trendColor: "text-violet-600",
    },
    {
      title: "Avg. Rating",
      value: stats?.averageRating?.toFixed(1) || "—",
      icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconBg: "bg-amber-100",
      trend: "Top host",
      trendColor: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Host Panel</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">Track earnings, bookings, and performance</p>
            </div>
            <Button asChild className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 gap-2">
              <Link href="/host/listings/new">
                <Plus className="w-4 h-4" /> Add New Spot
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ title, value, icon, bg, border, iconBg, trend, trendColor }) => (
            <div key={title} className={`${bg} border ${border} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                  {icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              {statsLoading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
              )}
              <p className="text-xs text-gray-500 font-medium">{title}</p>
              <p className={`text-xs font-semibold mt-2 ${trendColor}`}>{trend}</p>
            </div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Earnings chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Weekly Earnings</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                +18% vs last week
              </div>
            </div>
            {earningsLoading ? (
              <Skeleton className="w-full h-[260px] rounded-xl" />
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      cursor={{ fill: "#f9fafb", radius: 8 }}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                      formatter={(v: number) => [`₹${v}`, "Earnings"]}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick actions + recent */}
          <div className="space-y-4">

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/host/listings/new">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 border border-transparent transition-all cursor-pointer group">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Add New Spot</p>
                      <p className="text-[11px] text-gray-400">List a new parking space</p>
                    </div>
                  </div>
                </Link>
                <Link href="/host/listings">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 hover:border-blue-100 border border-transparent transition-all cursor-pointer">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Manage Listings</p>
                      <p className="text-[11px] text-gray-400">Edit or remove spots</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 hover:border-amber-100 border border-transparent transition-all cursor-pointer">
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">View Bookings</p>
                    <p className="text-[11px] text-gray-400">Upcoming reservations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Recent Bookings</h2>
              <div className="space-y-3">
                {[
                  { name: "Rahul S.", spot: "BKC Spot", amount: "₹480", time: "2h ago" },
                  { name: "Priya M.", spot: "Andheri Garage", amount: "₹960", time: "5h ago" },
                  { name: "Amit K.", spot: "BKC Spot", amount: "₹240", time: "Yesterday" },
                ].map(({ name, spot, amount, time }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Car className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{name} · {spot}</p>
                      <p className="text-[11px] text-gray-400">{time}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 shrink-0">{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy / tip card */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wide mb-1">Pro Tip</p>
            <h3 className="text-white font-extrabold text-lg">Add weekend pricing to earn 40% more</h3>
            <p className="text-white/70 text-sm mt-1">Spots with dynamic pricing get 3× more bookings.</p>
          </div>
          <Button className="bg-white hover:bg-gray-50 text-emerald-700 font-bold rounded-full shrink-0 shadow-lg">
            Update Pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
