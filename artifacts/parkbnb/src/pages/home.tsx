import { useLocation } from "wouter";
import { Search, MapPin, Calendar, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetFeaturedListings, useGetPopularCities } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featuredListings, isLoading: isFeaturedLoading } = useGetFeaturedListings();
  const { data: popularCities, isLoading: isCitiesLoading } = useGetPopularCities();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/search");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="absolute inset-0 z-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Find the perfect spot, <br className="hidden md:block" />
            <span className="text-primary">every time.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10">
            Book private parking spaces by the hour, day, or month. Cheaper than garages, safer than the street.
          </p>
          
          {/* Search Widget */}
          <div className="w-full max-w-4xl bg-white rounded-2xl md:rounded-full shadow-lg p-2 md:p-4 border">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-200">
                <MapPin className="text-gray-400 w-5 h-5" />
                <div className="flex flex-col items-start w-full">
                  <label className="text-xs font-semibold text-gray-900">Where</label>
                  <Input 
                    placeholder="City, address, or venue" 
                    className="border-0 p-0 h-auto rounded-none focus-visible:ring-0 placeholder:text-gray-400 text-sm shadow-none"
                  />
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-2 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-200">
                <Calendar className="text-gray-400 w-5 h-5" />
                <div className="flex flex-col items-start w-full">
                  <label className="text-xs font-semibold text-gray-900">When</label>
                  <Input 
                    type="datetime-local" 
                    className="border-0 p-0 h-auto rounded-none focus-visible:ring-0 text-sm shadow-none w-full"
                  />
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-2 px-4 py-2 w-full">
                <Car className="text-gray-400 w-5 h-5" />
                <div className="flex flex-col items-start w-full">
                  <label className="text-xs font-semibold text-gray-900">Vehicle</label>
                  <select className="w-full border-0 p-0 text-sm focus:outline-none bg-transparent appearance-none">
                    <option value="">Any type</option>
                    <option value="compact">Compact / Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Truck / Van</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full md:w-auto rounded-xl md:rounded-full h-14 md:h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-md">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Spots</h2>
            <p className="text-gray-600 mt-2">Highly rated parking spaces available right now.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isFeaturedLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ))
          ) : (
            featuredListings?.slice(0, 4).map(listing => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))
          )}
        </div>
      </section>

      {/* Host CTA */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-16 md:py-24 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Earn from your unused parking space.</h2>
              <p className="text-lg text-gray-300 mb-8">
                Turn your driveway, garage, or business parking lot into passive income. It's free to list and you set your own rules.
              </p>
              <Button size="lg" className="rounded-full h-14 px-8 bg-primary hover:bg-primary/90 text-white text-lg font-medium" onClick={() => setLocation('/auth')}>
                Become a Host
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
