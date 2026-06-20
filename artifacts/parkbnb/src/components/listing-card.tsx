import { useState } from "react";
import { Link } from "wouter";
import { Star, MapPin, Heart, Car } from "lucide-react";
import { Listing } from "@workspace/api-client-react";

interface ListingCardProps {
  listing: Listing;
}

const CONFIRMED_PARKING = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&q=80";

const PLACEHOLDER_GRADIENTS = [
  { from: "#064e3b", to: "#065f46", accent: "#10b981" },
  { from: "#1e1b4b", to: "#312e81", accent: "#818cf8" },
  { from: "#451a03", to: "#78350f", accent: "#f59e0b" },
  { from: "#1e3a5f", to: "#1e40af", accent: "#60a5fa" },
];

const PRICE_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
];

function ParkingPlaceholder({ id, title }: { id: number; title: string }) {
  const g = PLACEHOLDER_GRADIENTS[id % PLACEHOLDER_GRADIENTS.length];
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      {/* Parking P circle */}
      <div
        className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: `${g.accent}22`, border: `2px solid ${g.accent}44` }}
      >
        <span className="text-4xl font-black" style={{ color: g.accent }}>P</span>
      </div>
      {/* Car icon row */}
      <div className="relative z-10 flex items-center gap-1 opacity-40">
        <Car className="w-3 h-3 text-white" />
        <Car className="w-3 h-3 text-white" />
        <Car className="w-3 h-3 text-white" />
      </div>
      {/* Initials watermark */}
      <div
        className="absolute bottom-4 right-4 text-xs font-bold opacity-20 tracking-widest"
        style={{ color: g.accent }}
      >
        {initials}
      </div>
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  const rawPhoto = listing.photos && listing.photos.length > 0
    ? listing.photos[0]
    : CONFIRMED_PARKING;

  const [imgSrc, setImgSrc] = useState(rawPhoto);
  const [imgFailed, setImgFailed] = useState(false);

  const priceColor = PRICE_COLORS[listing.id % PRICE_COLORS.length];

  const handleError = () => {
    if (imgSrc !== CONFIRMED_PARKING) {
      setImgSrc(CONFIRMED_PARKING);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="group cursor-pointer">
        {/* Image container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 mb-3">

          {/* Image or placeholder */}
          {imgFailed ? (
            <ParkingPlaceholder id={listing.id} title={listing.title} />
          ) : (
            <img
              src={imgSrc}
              alt={listing.title}
              onError={handleError}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* Top row — badge + favourite */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {listing.rating && listing.rating >= 4.5 ? (
              <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide">
                Top Rated
              </div>
            ) : (
              <div />
            )}

            {listing.isFavorited && (
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Price tag */}
          <div className={`absolute top-3 right-3 bg-gradient-to-br ${priceColor} text-white font-extrabold text-sm px-3 py-1.5 rounded-xl shadow-lg`}>
            ₹{listing.hourlyRate}<span className="text-white/70 font-medium text-xs">/hr</span>
          </div>

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

        {/* Below image metadata */}
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
