import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useGetMyBookings, useCancelBooking, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, User, Car, IndianRupee, Search, X } from "lucide-react";

const PARKING_PHOTO = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80";

type Booking = {
  id: number;
  listingId: number;
  listingTitle: string;
  listingAddress: string;
  listingPhoto?: string | null;
  driverName?: string | null;
  driverAvatar?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  vehicleType?: string | null;
  vehiclePlate?: string | null;
  pricingType?: string;
};

const STATUS_STYLES: Record<string, { pill: string; label: string }> = {
  confirmed: { pill: "bg-emerald-100 text-emerald-700", label: "Confirmed" },
  pending:   { pill: "bg-amber-100 text-amber-700",   label: "Pending" },
  active:    { pill: "bg-blue-100 text-blue-700",     label: "Active" },
  completed: { pill: "bg-gray-100 text-gray-600",     label: "Completed" },
  cancelled: { pill: "bg-red-100 text-red-600",       label: "Cancelled" },
};

export default function HostBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useGetMyBookings({ role: "host" });
  const cancelBooking = useCancelBooking();

  const handleCancel = (id: number) => {
    if (!confirm("Cancel this booking? The driver will be notified.")) return;
    cancelBooking.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Booking cancelled" });
        queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey({ role: "host" }) });
      },
      onError: () => toast({ variant: "destructive", title: "Failed to cancel booking" }),
    });
  };

  const all = (bookings as Booking[] | undefined) || [];
  const filtered = all.filter(b => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSearch = !search ||
      b.listingTitle?.toLowerCase().includes(search.toLowerCase()) ||
      b.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehiclePlate?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = all
    .filter(b => b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Host Panel</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Booking History</h1>
              <p className="text-gray-400 text-sm mt-0.5">All bookings across your parking spots</p>
            </div>
            {/* Revenue summary */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 text-right">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-0.5">Total Revenue</p>
              <p className="text-2xl font-extrabold text-gray-900">₹{totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-400">{all.filter(b => b.status !== "cancelled").length} bookings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by spot, driver, or plate…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {/* Status pills */}
          <div className="flex gap-2 flex-wrap">
            {["all", "confirmed", "active", "completed", "cancelled"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                  statusFilter === s
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {s === "all" ? `All (${all.length})` : s}
              </button>
            ))}
          </div>
        </div>

        {/* Booking list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <Skeleton className="w-24 h-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="w-20 h-8 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              {all.length === 0 ? "No bookings yet" : "No bookings match"}
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              {all.length === 0
                ? "Once drivers start booking your spots, they'll show up here."
                : "Try adjusting your search or filter."}
            </p>
            {all.length === 0 && (
              <Button asChild className="mt-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <Link href="/host/listings/new">Add Your First Spot</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const style = STATUS_STYLES[booking.status] || STATUS_STYLES.completed;
              const photo = booking.listingPhoto || PARKING_PHOTO;
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Listing photo */}
                    <div className="sm:w-36 h-28 sm:h-auto shrink-0 overflow-hidden">
                      <img
                        src={photo}
                        alt="Parking"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = PARKING_PHOTO; }}
                      />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Title + status */}
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <Link href={`/listings/${booking.listingId}`}>
                              <h3 className="font-extrabold text-gray-900 text-base hover:text-emerald-600 transition-colors line-clamp-1">
                                {booking.listingTitle}
                              </h3>
                            </Link>
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {booking.listingAddress}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${style.pill}`}>
                            {style.label}
                          </span>
                        </div>

                        {/* Driver info */}
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                            <span className="font-semibold">{booking.driverName || "Driver"}</span>
                          </div>
                          {(booking.vehiclePlate || booking.vehicleType) && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                              <Car className="w-3 h-3" />
                              {booking.vehiclePlate}
                              {booking.vehicleType && ` · ${booking.vehicleType}`}
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {format(new Date(booking.startDate), "d MMM, h:mm a")}
                            {" → "}
                            {format(new Date(booking.endDate), "d MMM, h:mm a")}
                          </span>
                          {booking.pricingType && (
                            <span className="capitalize text-gray-400">· {booking.pricingType}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-3 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-0.5 justify-end">
                            <IndianRupee className="w-4 h-4 text-emerald-600" />
                            <span className="text-xl font-extrabold text-gray-900">
                              {Number(booking.totalPrice).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">earned</p>
                        </div>

                        <div className="flex gap-2">
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancelBooking.isPending}
                              className="text-xs font-semibold text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all"
                            >
                              Cancel
                            </button>
                          )}
                          <Link href={`/listings/${booking.listingId}`}>
                            <button className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-full transition-all">
                              View Spot
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
