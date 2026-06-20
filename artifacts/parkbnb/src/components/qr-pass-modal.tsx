import { useRef } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Car, Download, CheckCircle2, QrCode } from "lucide-react";

interface QrPassModalProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: number;
    listingTitle: string;
    listingAddress: string;
    startDate: string;
    endDate: string;
    vehicleType?: string;
    vehiclePlate?: string;
    status: string;
    totalPrice: number;
  };
}

export function QrPassModal({ open, onClose, booking }: QrPassModalProps) {
  const passRef = useRef<HTMLDivElement>(null);

  const passData = JSON.stringify({
    bookingId: booking.id,
    spot: booking.listingTitle,
    checkIn: booking.startDate,
    checkOut: booking.endDate,
    plate: booking.vehiclePlate,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(passData)}&bgcolor=ffffff&color=111827&margin=10&qzone=1`;

  const checkIn = new Date(booking.startDate);
  const checkOut = new Date(booking.endDate);
  const durationMs = checkOut.getTime() - checkIn.getTime();
  const durationHrs = Math.round(durationMs / 3600000);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-2xl gap-0">
        {/* Pass card */}
        <div ref={passRef} className="bg-white">
          {/* Header strip */}
          <div className="bg-gray-900 px-6 pt-6 pb-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-12 w-40 h-40 rounded-full bg-white/5" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-white font-bold text-sm">ParkBnB Entry Pass</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight relative z-10 pr-12">
              {booking.listingTitle}
            </h2>
            <p className="text-gray-400 text-xs mt-1 flex items-center gap-1 relative z-10">
              <MapPin className="h-3 w-3" />
              {booking.listingAddress}
            </p>
          </div>

          {/* Tear line */}
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-gray-100 -ml-2.5 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
            <div className="w-5 h-5 rounded-full bg-gray-100 -mr-2.5 shrink-0" />
          </div>

          {/* QR code section */}
          <div className="px-6 py-5 flex flex-col items-center gap-3">
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-2 shadow-sm">
              <img
                src={qrUrl}
                alt="Entry QR Code"
                width={220}
                height={220}
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <QrCode className="h-3.5 w-3.5" />
              <span>Show this at the parking entrance</span>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Check-in
                </p>
                <p className="font-bold text-gray-900 text-sm">{format(checkIn, "MMM d")}</p>
                <p className="text-primary font-semibold text-lg">{format(checkIn, "h:mm a")}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Checkout
                </p>
                <p className="font-bold text-gray-900 text-sm">{format(checkOut, "MMM d")}</p>
                <p className="text-gray-700 font-semibold text-lg">{format(checkOut, "h:mm a")}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {booking.vehiclePlate || "—"}
                    {booking.vehicleType && <span className="text-gray-500 font-normal"> · {booking.vehicleType}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900 text-sm">{durationHrs}h</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Booking #{booking.id}</span>
              </div>
              <Badge className="bg-green-50 text-green-700 border-green-200 capitalize">
                {booking.status}
              </Badge>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50">
            <div>
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="font-bold text-gray-900">₹{booking.totalPrice.toFixed(0)}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-lg text-xs"
              onClick={() => window.print()}
            >
              <Download className="h-3.5 w-3.5" />
              Save Pass
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
