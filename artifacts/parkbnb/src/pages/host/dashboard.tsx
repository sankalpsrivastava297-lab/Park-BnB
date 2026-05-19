import { useGetDashboardStats, useGetEarnings } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { IndianRupee, MapPin, CalendarCheck, Star, Plus } from "lucide-react";

export default function HostDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: earnings, isLoading: earningsLoading } = useGetEarnings({ period: "week" });

  const chartData = earnings?.breakdown || [
    { period: 'Mon', amount: 45 },
    { period: 'Tue', amount: 30 },
    { period: 'Wed', amount: 55 },
    { period: 'Thu', amount: 40 },
    { period: 'Fri', amount: 80 },
    { period: 'Sat', amount: 120 },
    { period: 'Sun', amount: 105 },
  ]; // Fallback data

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your parking spots performance.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/host/listings/new">
            <Plus className="w-4 h-4 mr-2" /> Add New Spot
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Earnings" 
          value={`₹${stats?.totalEarnings?.toFixed(0) || '0'}`} 
          icon={<IndianRupee className="w-5 h-5 text-green-600" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Bookings" 
          value={stats?.totalBookings?.toString() || '0'} 
          icon={<CalendarCheck className="w-5 h-5 text-blue-600" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Active Listings" 
          value={stats?.activeListings?.toString() || '0'} 
          icon={<MapPin className="w-5 h-5 text-indigo-600" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Average Rating" 
          value={stats?.averageRating?.toFixed(1) || '0.0'} 
          icon={<Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₹${value}`, 'Earnings']}
                    />
                    <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              Recent Activity
              <Button variant="link" size="sm" className="px-0 h-auto font-normal text-primary">View all</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">Downtown Spot #{i}</p>
                    <p className="text-xs text-gray-500 truncate">New booking for tomorrow</p>
                  </div>
                  <div className="font-semibold text-sm">+₹480</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value: string, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
