import { Link } from "wouter";
import { Star, MapPin, Car } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@workspace/api-client-react";

interface ListingCardProps {
  listing: Listing;
}

const FALLBACK_IMAGES = [
  "/images/parking-1.png",
  "/images/parking-2.png",
  "/images/parking-3.png",
  "/images/parking-4.png",
];

export function ListingCard({ listing }: ListingCardProps) {
  const photoUrl = listing.photos && listing.photos.length > 0
    ? listing.photos[0]
    : FALLBACK_IMAGES[listing.id % FALLBACK_IMAGES.length];

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all cursor-pointer group h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={photoUrl}
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {listing.isFavorited && (
            <div className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
            {listing.rating && (
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span>{listing.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{listing.city}, {listing.state}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-auto">
            {listing.vehicleTypes?.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs font-normal">
                <Car className="w-3 h-3 mr-1" />
                {type}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-baseline gap-1 text-gray-900">
            <span className="text-lg font-bold">₹{listing.hourlyRate}</span>
            <span className="text-sm text-gray-500">/ hour</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
