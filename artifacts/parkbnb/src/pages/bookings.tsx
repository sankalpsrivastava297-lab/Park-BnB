import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  useGetMyBookings, 
  useCancelBooking,
  getGetMyBookingsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, QrCode, Star } from "lucide-react";
import { QrPassModal } from "@/components/qr-pass-modal";
import { ReviewModal } from "@/components/review-modal";

type Booking = {
  id: number;
  listingId: number;
  listingTitle: string;
  listingAddress: string;
  listingPhoto?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  vehicleType?: string;
  vehiclePlate?: string;
};

export default function Bookings() {
  const [tab, setTab] = useState("upcoming");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useGetMyBookings({ role: "driver" });
  const cancelBooking = useCancelBooking();

  const handleCancel = (id: number) => {
    cancelBooking.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Booking cancelled successfully" });
        queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey({ role: "driver" }) });
      }
    });
  };

  const filteredBookings = (bookings as Booking[] | undefined)?.filter(b => {
    if (tab === "upcoming") return b.status === "confirmed" || b.status === "pending" || b.status === "active";
    if (tab === "past") return b.status === "completed";
    if (tab === "cancelled") return b.status === "cancelled";
    return true;
  }) || [];

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-8 p-1 bg-gray-100">
          <TabsTrigger value="upcoming" className="rounded-md">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="rounded-md">Past</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-md">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-32 bg-gray-100 flex p-4 gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2 py-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4 mt-4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No {tab} bookings</h3>
              <p className="text-gray-500 mt-1 mb-6">You don't have any {tab} reservations right now.</p>
              {tab === "upcoming" && (
                <Button asChild>
                  <Link href="/search">Find a parking spot</Link>
                </Button>
              )}
            </div>
          ) : (
            filteredBookings.map(booking => (
              <Card key={booking.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0 sm:flex">
                  <div className="sm:w-48 h-32 sm:h-auto shrink-0 relative bg-gray-200">
                    <img 
                      src={booking.listingPhoto || "/images/parking-1.png"} 
                      alt="Parking" 
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-2 left-2 border-0 shadow-sm capitalize ${
                      booking.status === "confirmed" ? "bg-green-500 text-white hover:bg-green-500" :
                      booking.status === "pending" ? "bg-amber-500 text-white hover:bg-amber-500" :
                      booking.status === "completed" ? "bg-blue-500 text-white hover:bg-blue-500" :
                      "bg-white/90 text-gray-900 hover:bg-white"
                    }`}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/listings/${booking.listingId}`}>
                          <h3 className="text-lg font-semibold hover:text-primary hover:underline line-clamp-1">
                            {booking.listingTitle}
                          </h3>
                        </Link>
                        <span className="font-bold text-lg">₹{Number(booking.totalPrice).toFixed(0)}</span>
                      </div>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {booking.listingAddress}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Check-in</p>
                          <p className="font-medium">{format(new Date(booking.startDate), "MMM d, h:mm a")}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Checkout</p>
                          <p className="font-medium">{format(new Date(booking.endDate), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-600">
                        {booking.vehiclePlate && <span>{booking.vehiclePlate}</span>}
                        {booking.vehiclePlate && booking.vehicleType && <span> · </span>}
                        {booking.vehicleType && <span>{booking.vehicleType}</span>}
                      </div>
                      
                      <div className="flex gap-2">
                        {(booking.status === "confirmed" || booking.status === "active") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                            onClick={() => setQrBooking(booking)}
                          >
                            <QrCode className="w-4 h-4" />
                            Entry Pass
                          </Button>
                        )}
                        {(booking.status === "pending" || booking.status === "confirmed") && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBooking.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                        {booking.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                            onClick={() => setReviewBooking(booking)}
                          >
                            <Star className="w-4 h-4" />
                            Rate & Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* QR Entry Pass Modal */}
      {qrBooking && (
        <QrPassModal
          open={!!qrBooking}
          onClose={() => setQrBooking(null)}
          booking={qrBooking}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          open={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          listingId={reviewBooking.listingId}
          listingTitle={reviewBooking.listingTitle}
          bookingId={reviewBooking.id}
        />
      )}
    </div>
  );
}
