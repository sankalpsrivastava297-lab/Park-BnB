import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSearchListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, Map as MapIcon } from "lucide-react";

export default function SearchPage() {
  const [params, setParams] = useState({
    query: "",
    minPrice: 0,
    maxPrice: 50,
  });

  const { data, isLoading } = useSearchListings({
    query: params.query || undefined,
    minPrice: params.minPrice > 0 ? params.minPrice : undefined,
    maxPrice: params.maxPrice < 50 ? params.maxPrice : undefined,
  });

  const listings = data?.listings || [];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Filters Sidebar (Desktop) */}
      <div className="hidden lg:flex w-80 flex-col border-r bg-white overflow-y-auto p-6 shrink-0">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          <Input 
            placeholder="Search city or address..." 
            value={params.query}
            onChange={(e) => setParams({ ...params, query: e.target.value })}
            className="rounded-xl"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex justify-between">
            <span>Price Range</span>
            <span className="text-sm font-normal text-gray-500">${params.minPrice} - ${params.maxPrice}+ /hr</span>
          </h2>
          <Slider 
            defaultValue={[0, 50]} 
            max={50} 
            step={1} 
            onValueChange={(val) => setParams({ ...params, minPrice: val[0], maxPrice: val[1] })}
            className="mb-2"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Vehicle Size</h2>
          <div className="space-y-3">
            {['Compact', 'Sedan', 'SUV', 'Truck/Van', 'Motorcycle'].map((type) => (
              <div key={type} className="flex items-center space-x-3">
                <Checkbox id={`type-${type}`} />
                <Label htmlFor={`type-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Filters */}
        <div className="lg:hidden p-4 border-b bg-white flex gap-2">
          <Input 
            placeholder="Search..." 
            value={params.query}
            onChange={(e) => setParams({ ...params, query: e.target.value })}
            className="flex-1 rounded-full bg-gray-100 border-transparent focus-visible:ring-0 focus-visible:bg-white focus-visible:border-gray-300"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div className="mb-8">
                  <h2 className="text-sm font-semibold mb-4 flex justify-between">
                    <span>Price Range</span>
                    <span className="text-xs font-normal text-gray-500">${params.minPrice} - ${params.maxPrice}+</span>
                  </h2>
                  <Slider 
                    defaultValue={[0, 50]} 
                    max={50} 
                    step={1} 
                    onValueChange={(val) => setParams({ ...params, minPrice: val[0], maxPrice: val[1] })}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Info */}
        <div className="p-4 md:p-6 pb-2 md:pb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            {isLoading ? "Searching..." : `${data?.total || 0} spots available`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2">
              <MapIcon className="w-4 h-4" />
              Show Map
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No spots found</h3>
              <p className="text-gray-500 max-w-md">Try adjusting your filters or searching in a different area to find available parking.</p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full"
                onClick={() => setParams({ query: "", minPrice: 0, maxPrice: 50 })}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
