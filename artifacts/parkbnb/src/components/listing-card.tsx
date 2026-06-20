import { Link } from "wouter";
import { Star, MapPin, Heart } from "lucide-react";
import { Listing } from "@workspace/api-client-react";

interface ListingCardProps {
  listing: Listing;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=600&q=80",
  "https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=600&q=80",
  "https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=80",
];

const PRICE_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
];

export function ListingCard({ listing }: ListingCardProps) {
  const photoUrl = listing.photos && listing.photos.length > 0
    ? listing.photos[0]
    : FALLBACK_IMAGES[listing.id % FALLBACK_IMAGES.length];

  const priceColor = PRICE_COLORS[listing.id % PRICE_COLORS.length];

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="group cursor-pointer">
        {/* Image container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
          <img
            src={photoUrl}
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Top row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {listing.rating && listing.rating >= 4.5 && (
              <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide">
                Top Rated
              </div>
            )}
            {!listing.rating || listing.rating < 4.5 ? <div /> : null}

            {listing.isFavorited && (
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Price tag */}
          <div className="absolute top-3 right-3">
            {!listing.isFavorited && (
              <div className={`bg-gradient-to-br ${priceColor} text-white font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-lg`}>
                ₹{listing.hourlyRate}<span className="text-white/70 font-medium text-xs">/hr</span>
              </div>
            )}
          </div>
          {listing.isFavorited && (
            <div className={`absolute top-3 right-3 bg-gradient-to-br ${priceColor} text-white font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-lg`}>
              ₹{listing.hourlyRate}<span className="text-white/70 font-medium text-xs">/hr</span>
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-base leading-tight line-clamp-2 mb-1.5 drop-shadow">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{listing.city}</span>
              </div>
              {listing.rating && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-white text-xs font-bold">{listing.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Below image info */}
        <div className="px-1">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs">{listing.city}, {listing.state}</p>
            {listing.vehicleTypes && listing.vehicleTypes.length > 0 && (
              <p className="text-gray-400 text-xs">
                {listing.vehicleTypes.slice(0, 2).join(" · ")}
                {listing.vehicleTypes.length > 2 && ` +${listing.vehicleTypes.length - 2}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
