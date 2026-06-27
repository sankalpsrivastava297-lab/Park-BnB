import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Zap, Shield, QrCode, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetFeaturedListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = [
  { city: "Mumbai", emoji: "🏙️", spots: "180+", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80" },
  { city: "Delhi", emoji: "🕌", spots: "140+", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80" },
  { city: "Bangalore", emoji: "💻", spots: "120+", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80" },
  { city: "Pune", emoji: "🎓", spots: "80+", img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80" },
  { city: "Hyderabad", emoji: "💊", spots: "90+", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80" },
  { city: "Chennai", emoji: "🌊", spots: "75+", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80" },
  { city: "Kolkata", emoji: "🌁", spots: "60+", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { city: "Jaipur", emoji: "🏰", spots: "40+", img: "https://images.unsplash.com/photo-1477587458883-47145ed68979?w=400&q=80" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [city, setCity] = useState("");
  const { data: featuredListings, isLoading: isFeaturedLoading } = useGetFeaturedListings();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(city ? `/search?q=${encodeURIComponent(city)}` : "/search");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white min-h-[85vh] flex items-center">
        {/* Subtle decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-100/60 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-emerald-50/80 blur-[60px] pointer-events-none" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #10b98115 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white text-emerald-700 text-xs font-bold px-5 py-2 rounded-full border border-emerald-200 shadow-sm mb-8 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            🇮🇳 Now live across India
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.0] mb-6">
            Parking ki<br />
            <span className="text-emerald-500">tension?</span>
            <br />
            <span className="text-gray-400">Chhod do.</span>
          </h1>

          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed font-medium">
            Book private parking across Mumbai, Delhi, Bangalore & more —<br className="hidden md:block" />
            by the hour, day, or month. UPI payment. QR entry. Zero drama.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-xl shadow-gray-200/60 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <MapPin className="text-emerald-500 w-4 h-4 shrink-0" />
                <Input
                  placeholder="Mumbai, Delhi, Bangalore…"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto text-gray-900 placeholder:text-gray-400 text-sm focus-visible:ring-0 shadow-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/25 gap-2"
              >
                <Search className="w-4 h-4" />
                Find Parking
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {[
              { value: "500+", label: "Verified spots" },
              { value: "8", label: "Major cities" },
              { value: "₹50", label: "Starting / hour" },
              { value: "4.8★", label: "Avg. rating" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-black text-gray-900">{value}</span>
                <span className="text-xs text-gray-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">Handpicked for you</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Top Rated Spots</h2>
          </div>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-900 gap-1 hidden md:flex font-semibold"
            onClick={() => setLocation("/search")}
          >
            View all <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {isFeaturedLoading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
            : featuredListings?.slice(0, 4).map(listing => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))
          }
        </div>
      </section>

      {/* ── CITIES GRID ────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">Across India</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Browse by City</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {CITIES.map(({ city, emoji, spots, img }) => (
              <button
                key={city}
                onClick={() => setLocation(`/search?q=${city}`)}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] text-left shadow-sm hover:shadow-lg transition-shadow"
              >
                <img
                  src={img}
                  alt={city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="text-xl mb-0.5 block">{emoji}</span>
                  <p className="font-bold text-white text-base leading-tight">{city}</p>
                  <p className="text-white/70 text-xs font-medium">{spots} spots</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-3">Simple as chai</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Park in 3 steps</h2>
            <p className="text-gray-400 mt-3 text-base">No app needed. No cash needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                step: "01",
                title: "Search",
                desc: "Enter your city, pick your time and vehicle. See real spots, real prices, real reviews.",
                bg: "bg-emerald-500",
                icon: <Search className="w-6 h-6 text-white" />,
              },
              {
                step: "02",
                title: "Pay Securely",
                desc: "UPI, PhonePe, GPay, or card. One tap checkout. Your money is safe, always.",
                bg: "bg-violet-500",
                icon: <Zap className="w-6 h-6 text-white" />,
              },
              {
                step: "03",
                title: "Park & Go",
                desc: "Get your QR entry pass instantly. Show it at the gate. No cash, no stress.",
                bg: "bg-amber-500",
                icon: <QrCode className="w-6 h-6 text-white" />,
              },
            ].map(({ step, title, desc, bg, icon }, i) => (
              <div key={step} className="relative group">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-1px)] w-full h-px bg-gradient-to-r from-gray-200 to-transparent z-10" />
                )}
                <div className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 h-full">
                  <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-6 shadow-lg`}>
                    {icon}
                  </div>
                  <div className="text-5xl font-black text-gray-100 mb-2 leading-none">{step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PARKBNB ────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-3">Why ParkBnB</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">India's smartest<br />parking platform</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Search className="w-6 h-6 text-emerald-600" />, title: "Smart Search", desc: "Filter by city, time, price range and vehicle type in seconds", bg: "bg-emerald-50 border-emerald-100" },
              { icon: <Zap className="w-6 h-6 text-amber-600" />, title: "Instant UPI Pay", desc: "PhonePe, GPay, UPI ID, RuPay card — one seamless checkout", bg: "bg-amber-50 border-amber-100" },
              { icon: <QrCode className="w-6 h-6 text-violet-600" />, title: "QR Entry Pass", desc: "Digital pass delivered instantly. Just scan and park", bg: "bg-violet-50 border-violet-100" },
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: "Verified Spots", desc: "Every listing verified. Real reviews from real drivers", bg: "bg-blue-50 border-blue-100" },
            ].map(({ icon, title, desc, bg }) => (
              <div key={title} className={`rounded-2xl p-7 border ${bg}`}>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-5 shadow-sm">
                  {icon}
                </div>
                <h3 className="text-gray-900 font-bold text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOST CTA ───────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 min-h-[380px] flex items-center px-10 py-16 md:px-20">
            {/* Decorative circles */}
            <div className="absolute right-10 top-10 w-72 h-72 rounded-full border border-white/15 hidden lg:block" />
            <div className="absolute right-24 top-24 w-48 h-48 rounded-full border border-white/10 hidden lg:block" />
            <div className="absolute right-36 top-36 w-24 h-24 rounded-full bg-white/10 hidden lg:block" />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-emerald-100 text-xs font-black uppercase tracking-widest mb-6 bg-white/15 px-4 py-2 rounded-full border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200" /> For Property Owners
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                Apni parking se<br />
                <span className="text-emerald-200">₹15,000+</span> mahine<br />
                kamaiye.
              </h2>
              <p className="text-white/75 text-base leading-relaxed mb-10">
                Got a driveway, garage, or unused plot? List it free in 5 minutes.<br />
                You set the price. You control availability. We handle payments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full h-13 px-10 bg-white hover:bg-gray-50 text-emerald-700 font-bold text-base shadow-xl gap-2"
                  onClick={() => setLocation("/auth")}
                >
                  List Your Spot — Free <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-white/40 text-xs mt-5">No commission for first 90 days · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ───────────────────────────── */}
      <section className="py-10 px-4 md:px-8 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {[
            { icon: "🔒", text: "100% Secure Payments" },
            { icon: "⭐", text: "4.8 Average Rating" },
            { icon: "📱", text: "UPI / PhonePe / GPay" },
            { icon: "🅿️", text: "500+ Verified Spots" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span className="text-lg">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
