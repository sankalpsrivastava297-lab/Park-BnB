import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useGetBooking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, MapPin, Calendar, Car, Download, ArrowRight, Home, QrCode } from "lucide-react";
import { QrPassModal } from "@/components/qr-pass-modal";

export default function BookingConfirmed() {
  const [, setLocation] = useLocation();
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) setBookingId(Number(id));
    // Entrance animation delay
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const { data: booking, isLoading } = useGetBooking(bookingId as number, {
    query: { enabled: !!bookingId },
  });

  if (!bookingId || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  const b = booking as any;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className={`max-w-lg mx-auto px-4 py-12 md:py-20 transition-all duration-500 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg animate-bounce">
              🎉
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Booking Confirmed!</h1>
          <p className="text-gray-500 text-base max-w-xs">
            Your parking spot is reserved. Show the QR pass at the gate to enter.
          </p>
        </div>

        {/* Booking card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/60 overflow-hidden mb-6">
          {/* Top stripe */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-0.5">Booking ID</p>
            <p className="text-white font-extrabold text-xl">#{b?.id || bookingId}</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Spot info */}
            <div className="flex items-start gap-3 pb-5 border-b border-gray-50">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-base">{b?.listingTitle || "Parking Spot"}</p>
                <p className="text-gray-400 text-sm mt-0.5">{b?.listingAddress || "Address shared via QR pass"}</p>
              </div>
            </div>

            {/* Date/time */}
            <div className="flex items-start gap-3 pb-5 border-b border-gray-50">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm mb-2">Duration</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wide mb-1">Arrival</p>
                    <p className="font-semibold text-gray-900">
                      {b?.startDate ? format(new Date(b.startDate), "d MMM, h:mm a") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wide mb-1">Departure</p>
                    <p className="font-semibold text-gray-900">
                      {b?.endDate ? format(new Date(b.endDate), "d MMM, h:mm a") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            {(b?.vehicleType || b?.vehiclePlate) && (
              <div className="flex items-center gap-3 pb-5 border-b border-gray-50">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Vehicle</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {b.vehicleType}{b.vehiclePlate ? ` · ${b.vehiclePlate}` : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
              <div>
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide">Amount Paid</p>
                <p className="text-emerald-600 text-xs mt-0.5">Inclusive of all charges</p>
              </div>
              <p className="text-2xl font-extrabold text-emerald-700">
                ₹{Number(b?.totalPrice || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* QR Entry Pass CTA */}
        <div
          onClick={() => setQrOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 rounded-3xl p-5 mb-4 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base">View QR Entry Pass</p>
              <p className="text-white/50 text-xs mt-0.5">Show at the gate to enter</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        {/* Next steps */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
          <p className="text-amber-800 font-bold text-sm mb-3">📋 What's next</p>
          <ul className="space-y-2">
            {[
              "Your QR entry pass is ready above — screenshot it",
              "Arrive at the spot at your scheduled time",
              "Show QR at gate or type in your plate number",
              "After parking, rate your experience",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-amber-700 text-sm">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full h-12 font-semibold border-gray-200 gap-2"
            onClick={() => setLocation("/")}
          >
            <Home className="w-4 h-4" /> Back to Home
          </Button>
          <Button
            className="flex-1 rounded-full h-12 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 gap-2"
            onClick={() => setLocation("/bookings")}
          >
            My Bookings <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* QR Pass Modal */}
      {qrOpen && b && (
        <QrPassModal
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          booking={b}
        />
      )}
    </div>
  );
}
