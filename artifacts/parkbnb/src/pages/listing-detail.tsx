import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format, addHours, differenceInHours, differenceInDays } from "date-fns";
import {
  useGetListing,
  useGetListingReviews,
  getGetListingQueryKey,
  getGetListingReviewsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin, Star, Car, Shield, CheckCircle, Camera, Lock, Clock,
  Zap, Droplets, Sun, ArrowLeft, Heart, Share2
} from "lucide-react";
import { PaymentModal } from "@/components/payment-modal";

const PARKING_PHOTO = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&q=80&auto=format&fit=crop";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Covered":          <Sun className="w-5 h-5 text-amber-500" />,
  "Security Camera":  <Camera className="w-5 h-5 text-blue-500" />,
  "Gated":            <Lock className="w-5 h-5 text-gray-600" />,
  "24/7 Access":      <Clock className="w-5 h-5 text-emerald-500" />,
  "Lighting":         <Sun className="w-5 h-5 text-yellow-500" />,
  "EV Charging":      <Zap className="w-5 h-5 text-violet-500" />,
  "Wash Area":        <Droplets className="w-5 h-5 text-cyan-500" />,
  "Guard":            <Shield className="w-5 h-5 text-emerald-600" />,
};

export default function ListingDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:00"));
  const [endDate, setEndDate] = useState(format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:00"));
  const [pricingType, setPricingType] = useState("hourly");
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: listing, isLoading } = useGetListing(id, {
    query: { enabled: !!id, queryKey: getGetListingQueryKey(id) },
  });
  const { data: reviews } = useGetListingReviews(id, {
    query: { enabled: !!id, queryKey: getGetListingReviewsQueryKey(id) },
  });

  const calculateTotal = () => {
    if (!listing) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (pricingType === "hourly") {
      return Math.max(1, differenceInHours(end, start)) * listing.hourlyRate;
    } else if (pricingType === "daily" && listing.dailyRate) {
      return Math.max(1, differenceInDays(end, start)) * listing.dailyRate;
    } else if (listing.monthlyRate) {
      return listing.monthlyRate;
    }
    return 0;
  };

  const handleBook = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to book a space." });
      setLocation("/auth");
      return;
    }
    setPaymentOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 py-8 space-y-6">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-10 w-2/3 rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">🅿️</div>
        <h2 className="text-xl font-bold text-gray-900">Listing not found</h2>
        <Button variant="outline" onClick={() => setLocation("/search")}>Back to Search</Button>
      </div>
    );
  }

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : [PARKING_PHOTO];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setLocation("/search")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to results
          </button>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-full px-4 py-2 hover:shadow-sm transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-full px-4 py-2 hover:shadow-sm transition-all">
              <Heart className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {listing.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900">{listing.rating.toFixed(1)}</span>
                <span className="text-gray-400">· {listing.reviewCount || 0} reviews</span>
              </div>
            )}
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{listing.address}, {listing.city}</span>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[280px] md:h-[420px] rounded-3xl overflow-hidden mb-10 shadow-lg">
          <div className="md:col-span-2 relative overflow-hidden">
            <img src={photos[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-2">
            <div className="overflow-hidden rounded-none">
              <img src={photos[1 % photos.length]} alt="2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
            </div>
            <div className="overflow-hidden">
              <img src={photos[2 % photos.length]} alt="3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
            </div>
          </div>
          <div className="hidden md:grid grid-rows-2 gap-2">
            <div className="overflow-hidden">
              <img src={photos[0]} alt="4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
            </div>
            <div className="overflow-hidden relative">
              <img src={photos[1 % photos.length]} alt="5" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
              <button className="absolute bottom-3 right-3 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50">
                Show all photos
              </button>
            </div>
          </div>
        </div>

        {/* Content + Booking widget */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          <div className="space-y-10">

            {/* Host row */}
            <div className="flex items-center justify-between pb-8 border-b border-gray-100">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Hosted by {listing.hostName}
                </h2>
                <p className="text-gray-400 text-sm">
                  {listing.availableSpots}/{listing.totalSpots} spots available
                </p>
              </div>
              <Avatar className="h-14 w-14 border-2 border-gray-100 shadow-md">
                <AvatarImage src={listing.hostAvatar || ""} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-lg">
                  {listing.hostName?.substring(0, 2).toUpperCase() || "H"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Quick highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, title: "Verified Spot", sub: "Identity-checked host" },
                { icon: <Shield className="w-5 h-5 text-blue-500" />, title: "Secure Payment", sub: "UPI · Card · Net Banking" },
                { icon: <Clock className="w-5 h-5 text-amber-500" />, title: "Instant Entry", sub: "QR pass on booking" },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pb-8 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this space</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description || "A convenient and safe parking space available for your vehicle."}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What this space offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {(listing.amenities?.length ? listing.amenities : ["Standard parking spot"]).map(amenity => (
                  <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      {AMENITY_ICONS[amenity] || <CheckCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <span className="text-gray-700 font-medium text-sm capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicles */}
            <div className="pb-8 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Allowed Vehicles</h3>
              <div className="flex flex-wrap gap-3">
                {listing.vehicleTypes?.map(type => (
                  <div key={type} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium">
                    <Car className="w-4 h-4 text-emerald-400" />
                    {type}
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-500 text-sm mb-4">{listing.city}, {listing.state} · Exact address after booking</p>
              <div className="w-full h-[260px] bg-gray-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-5 py-2.5 rounded-full text-sm font-semibold">
                    📍 {listing.city}, {listing.state}
                  </div>
                  <p className="text-white/40 text-xs">Exact location shared after booking</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {listing.rating?.toFixed(1)} · {listing.reviewCount} reviews
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.slice(0, 4).map((review: any) => (
                    <div key={review.id} className="p-5 bg-gray-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                            {review.userName?.substring(0, 1).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.userName || "User"}</p>
                            <p className="text-gray-400 text-xs">{format(new Date(review.createdAt || Date.now()), "MMM yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array(Math.min(5, Math.max(1, review.rating || 5))).fill(0).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div>
            <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
              {/* Widget header */}
              <div className="bg-gray-950 px-6 pt-6 pb-5">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white">₹{listing.hourlyRate}</span>
                  <span className="text-white/50 mb-1 text-sm">/ hour</span>
                </div>
                {listing.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-white/70 text-xs font-medium">{listing.rating.toFixed(1)} · {listing.reviewCount} reviews</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Date inputs */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  <div className="p-4">
                    <Label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Arrival</Label>
                    <Input
                      type="datetime-local"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="border-0 p-0 h-auto focus-visible:ring-0 shadow-none text-sm font-medium"
                    />
                  </div>
                  <div className="p-4">
                    <Label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1.5 block">Departure</Label>
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="border-0 p-0 h-auto focus-visible:ring-0 shadow-none text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Pricing type pills */}
                <div>
                  <Label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2 block">Duration</Label>
                  <div className="flex gap-2">
                    {[
                      { key: "hourly", label: "Hourly" },
                      ...(listing.dailyRate ? [{ key: "daily", label: "Daily" }] : []),
                      ...(listing.monthlyRate ? [{ key: "monthly", label: "Monthly" }] : []),
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setPricingType(key)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                          pricingType === key
                            ? "bg-gray-900 text-white shadow-sm"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-semibold text-sm">Total Amount</span>
                    <span className="text-2xl font-black text-emerald-700">₹{calculateTotal().toFixed(0)}</span>
                  </div>
                  <p className="text-emerald-500 text-xs mt-1">Inclusive of all charges</p>
                </div>

                {/* CTA */}
                <Button
                  className="w-full h-14 text-base font-bold rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/40 hover:scale-[1.01]"
                  onClick={handleBook}
                >
                  Reserve & Pay Securely
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>UPI · PhonePe · GPay · Card</span>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-gray-100 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>₹{listing.hourlyRate} × {Math.max(1, differenceInHours(new Date(endDate), new Date(startDate)))} hrs</span>
                    <span className="font-medium">₹{calculateTotal().toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Platform fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {listing && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          amount={calculateTotal()}
          listingId={id}
          listingTitle={listing.title}
          startDate={startDate}
          endDate={endDate}
          pricingType={pricingType}
          vehicleType={user?.vehicleType || "Sedan"}
          vehiclePlate={user?.vehiclePlate || ""}
          onSuccess={() => setLocation("/bookings")}
        />
      )}
    </div>
  );
}
