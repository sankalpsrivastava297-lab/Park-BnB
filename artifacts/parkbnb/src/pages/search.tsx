import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSearchListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, MapPin, ArrowLeft } from "lucide-react";

const VEHICLE_TYPES = ["Two-Wheeler", "Hatchback", "Sedan", "SUV/MUV", "Truck/Tempo"];

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [params, setParams] = useState({
    query: "",
    minPrice: 0,
    maxPrice: 500,
    vehicleTypes: [] as string[],
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    if (q) setParams(p => ({ ...p, query: q }));
  }, [location]);

  const { data, isLoading } = useSearchListings({
    query: params.query || undefined,
    minPrice: params.minPrice > 0 ? params.minPrice : undefined,
    maxPrice: params.maxPrice < 500 ? params.maxPrice : undefined,
  });

  const listings = data?.listings || [];
  const total = data?.total || 0;

  const toggleVehicle = (type: string) => {
    setParams(p => ({
      ...p,
      vehicleTypes: p.vehicleTypes.includes(type)
        ? p.vehicleTypes.filter(t => t !== type)
        : [...p.vehicleTypes, type],
    }));
  };

  const clearAll = () => setParams({ query: "", minPrice: 0, maxPrice: 500, vehicleTypes: [] });
  const hasFilters = params.query || params.minPrice > 0 || params.maxPrice < 500 || params.vehicleTypes.length > 0;

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Price per hour</h3>
        <div className="px-1">
          <Slider
            value={[params.minPrice, params.maxPrice]}
            min={0}
            max={500}
            step={10}
            onValueChange={(val) => setParams(p => ({ ...p, minPrice: val[0], maxPrice: val[1] }))}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
            <span className="bg-gray-100 px-3 py-1.5 rounded-lg">₹{params.minPrice}</span>
            <span className="text-gray-400 text-xs">to</span>
            <span className="bg-gray-100 px-3 py-1.5 rounded-lg">₹{params.maxPrice}+</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Vehicle Type</h3>
        <div className="space-y-2">
          {VEHICLE_TYPES.map(type => (
            <button
              key={type}
              onClick={() => toggleVehicle(type)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                params.vehicleTypes.includes(type)
                  ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-400"
                  : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
              }`}
            >
              {type}
              {params.vehicleTypes.includes(type) && (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8 2 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" onClick={clearAll} className="w-full rounded-xl gap-2 border-gray-200">
          <X className="w-3.5 h-3.5" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-r border-gray-100 bg-white overflow-y-auto shrink-0">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Filters</h2>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="City, area, or address…"
              value={params.query}
              onChange={(e) => setParams(p => ({ ...p, query: e.target.value }))}
              className="pl-9 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-emerald-500 focus-visible:bg-white"
            />
          </div>
        </div>
        <div className="p-6 flex-1">
          <FilterPanel />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile search bar */}
        <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by city or area…"
              value={params.query}
              onChange={(e) => setParams(p => ({ ...p, query: e.target.value }))}
              className="pl-9 rounded-full bg-gray-100 border-transparent focus-visible:ring-0 focus-visible:bg-white focus-visible:border-gray-200"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full shrink-0 relative ${hasFilters ? "border-emerald-400 text-emerald-600" : ""}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {hasFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left font-extrabold">Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors shrink-0 mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">Back</span>
          </button>
          <div className="flex-1">
            {isLoading ? (
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                {total === 0 ? "No spots found" : `${total} parking spot${total !== 1 ? "s" : ""} available`}
                {params.query && <span className="text-gray-400 font-normal"> near "{params.query}"</span>}
              </p>
            )}
          </div>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Listings */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[220px] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-4/5 rounded-lg" />
                  <Skeleton className="h-4 w-3/5 rounded-lg" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 text-4xl">🅿️</div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">No spots found</h3>
              <p className="text-gray-400 max-w-xs text-sm leading-relaxed">
                Try adjusting your filters or searching in a different area to find available parking.
              </p>
              <Button
                onClick={clearAll}
                className="mt-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
