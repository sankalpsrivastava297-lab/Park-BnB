import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format, addHours, differenceInHours, differenceInDays } from "date-fns";
import { 
  useGetListing, 
  useGetListingReviews, 
  useCreateBooking, 
  getGetListingQueryKey,
  getGetListingReviewsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Car, Shield, Clock, CalendarDays, CheckCircle } from "lucide-react";

export default function ListingDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:00"));
  const [endDate, setEndDate] = useState(format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:00"));
  const [pricingType, setPricingType] = useState("hourly");

  const { data: listing, isLoading } = useGetListing(id, {
    query: { enabled: !!id, queryKey: getGetListingQueryKey(id) }
  });

  const { data: reviews } = useGetListingReviews(id, {
    query: { enabled: !!id, queryKey: getGetListingReviewsQueryKey(id) }
  });

  const createBooking = useCreateBooking();

  const calculateTotal = () => {
    if (!listing) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (pricingType === "hourly") {
      const hours = Math.max(1, differenceInHours(end, start));
      return hours * listing.hourlyRate;
    } else if (pricingType === "daily" && listing.dailyRate) {
      const days = Math.max(1, differenceInDays(end, start));
      return days * listing.dailyRate;
    } else if (listing.monthlyRate) {
      return listing.monthlyRate;
    }
    return 0;
  };

  const handleBook = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to book a space.",
      });
      setLocation("/auth");
      return;
    }

    createBooking.mutate({
      data: {
        listingId: id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        pricingType,
        totalPrice: calculateTotal(),
        vehicleType: user.vehicleType || "Compact",
        vehiclePlate: user.vehiclePlate || ""
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Booking confirmed!",
          description: "Your parking space has been booked successfully.",
        });
        setLocation("/bookings");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Booking failed",
          description: "There was an error processing your booking. Please try again.",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 py-8 space-y-8">
        <Skeleton className="h-10 w-2/3 md:w-1/2 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-64 col-span-1 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl hidden lg:block" />
          <Skeleton className="h-64 rounded-2xl hidden lg:block" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          <div className="space-y-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return <div className="p-8 text-center">Listing not found</div>;
  }

  const photos = listing.photos && listing.photos.length > 0 
    ? listing.photos 
    : ["/images/parking-1.png", "/images/parking-2.png", "/images/parking-3.png"];

  return (
    <div className="max-w-6xl mx-auto p-4 py-8 md:py-12">
      {/* Title & Header Info */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{listing.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-gray-900">{listing.rating?.toFixed(1) || "New"}</span>
            <span className="underline ml-1">({listing.reviewCount || 0} reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="underline">{listing.address}, {listing.city}, {listing.state}</span>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-12">
        <div className="md:col-span-2 h-full">
          <img src={photos[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
          <img src={photos[1 % photos.length]} alt="Secondary 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
          <img src={photos[2 % photos.length]} alt="Secondary 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
          <img src={photos[3 % photos.length]} alt="Secondary 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
          <img src={photos[0 % photos.length]} alt="Secondary 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 relative">
        {/* Main Content */}
        <div className="space-y-10">
          {/* Host Info */}
          <div className="flex justify-between items-center pb-8 border-b">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-1">Hosted by {listing.hostName}</h2>
              <p className="text-gray-500 text-sm">Joined in 2024</p>
            </div>
            <Avatar className="h-14 w-14 border shadow-sm">
              <AvatarImage src={listing.hostAvatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {listing.hostName?.substring(0, 2).toUpperCase() || "H"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-4">About this space</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {listing.description || "A convenient and safe parking space available for your vehicle."}
            </p>
          </div>

          {/* Features / Amenities */}
          <div className="pb-8 border-b">
            <h3 className="text-xl font-semibold mb-6">What this space offers</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {listing.amenities?.map(amenity => (
                <div key={amenity} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
              {!listing.amenities?.length && (
                <div className="flex items-center gap-3 text-gray-700 col-span-2">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span>Standard parking spot</span>
                </div>
              )}
            </div>
          </div>

          {/* Allowed Vehicles */}
          <div className="pb-8 border-b">
            <h3 className="text-xl font-semibold mb-6">Allowed Vehicles</h3>
            <div className="flex flex-wrap gap-4">
              {listing.vehicleTypes?.map(type => (
                <div key={type} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Car className="w-5 h-5 text-gray-500" />
                  <span className="capitalize font-medium">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <p className="text-gray-600 mb-4">{listing.city}, {listing.state}</p>
            <div className="w-full h-[300px] bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=800x400&maptype=roadmap&key=mock')] bg-cover opacity-50 grayscale mix-blend-multiply"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg mb-2 shadow-primary/30">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-md text-sm font-semibold">
                  Exact location provided after booking
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div>
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-bold">${listing.hourlyRate}</span>
              <span className="text-gray-500">/ hour</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-300 rounded-xl overflow-hidden divide-y">
                <div className="p-3">
                  <Label className="text-xs uppercase font-bold text-gray-500 mb-1">Check-in</Label>
                  <Input 
                    type="datetime-local" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="border-0 p-0 h-auto focus-visible:ring-0 shadow-none" 
                  />
                </div>
                <div className="p-3">
                  <Label className="text-xs uppercase font-bold text-gray-500 mb-1">Checkout</Label>
                  <Input 
                    type="datetime-local" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="border-0 p-0 h-auto focus-visible:ring-0 shadow-none" 
                  />
                </div>
              </div>

              <div className="p-3 border border-gray-300 rounded-xl">
                <Label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Pricing Type</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={pricingType === "hourly" ? "default" : "outline"} 
                    className="flex-1 text-xs h-8"
                    onClick={() => setPricingType("hourly")}
                  >
                    Hourly
                  </Button>
                  {listing.dailyRate && (
                    <Button 
                      type="button" 
                      variant={pricingType === "daily" ? "default" : "outline"} 
                      className="flex-1 text-xs h-8"
                      onClick={() => setPricingType("daily")}
                    >
                      Daily
                    </Button>
                  )}
                  {listing.monthlyRate && (
                    <Button 
                      type="button" 
                      variant={pricingType === "monthly" ? "default" : "outline"} 
                      className="flex-1 text-xs h-8"
                      onClick={() => setPricingType("monthly")}
                    >
                      Monthly
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button 
              className="w-full py-6 text-lg font-bold rounded-xl"
              onClick={handleBook}
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? "Reserving..." : "Reserve"}
            </Button>
            <p className="text-center text-xs text-gray-500 mt-4">You won't be charged yet</p>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
