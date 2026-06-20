import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Calendar, Car, ArrowRight, Star, Zap, Shield, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetFeaturedListings } from "@workspace/api-client-react";
import { ListingCard } from "@/components/listing-card";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = [
  { city: "Mumbai", emoji: "🏙️", spots: "180+", gradient: "from-blue-500 to-indigo-700", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80" },
  { city: "Delhi", emoji: "🕌", spots: "140+", gradient: "from-orange-500 to-rose-700", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80" },
  { city: "Bangalore", emoji: "💻", spots: "120+", gradient: "from-violet-500 to-purple-800", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80" },
  { city: "Pune", emoji: "🎓", spots: "80+", gradient: "from-emerald-500 to-teal-700", img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80" },
  { city: "Hyderabad", emoji: "💊", spots: "90+", gradient: "from-cyan-500 to-blue-700", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80" },
  { city: "Chennai", emoji: "🌊", spots: "75+", gradient: "from-amber-500 to-yellow-600", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80" },
  { city: "Kolkata", emoji: "🌁", spots: "60+", gradient: "from-pink-500 to-rose-700", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { city: "Jaipur", emoji: "🏰", spots: "40+", gradient: "from-rose-500 to-pink-700", img: "https://images.unsplash.com/photo-1477587458883-47145ed68979?w=400&q=80" },
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
      <section className="relative overflow-hidden bg-[#060d06] min-h-[90vh] flex items-center">
        {/* Atmospheric orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-60 -right-20 w-[700px] h-[700px] rounded-full bg-emerald-400/10 blur-[140px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/8 blur-[100px]" />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Floating accent shapes */}
        <div className="absolute top-16 right-[8%] w-24 h-24 rounded-3xl border border-emerald-500/20 rotate-12 hidden lg:block" />
        <div className="absolute bottom-24 left-[10%] w-16 h-16 rounded-2xl border border-emerald-500/20 -rotate-6 hidden lg:block" />
        <div className="absolute top-1/2 right-[5%] w-8 h-8 rounded-full bg-amber-400/30 hidden lg:block" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 py-24 md:py-32 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-5 py-2 rounded-full border border-emerald-500/20 mb-8 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            🇮🇳 Now live across India
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[0.95] mb-6">
            Parking ki<br />
            <span className="relative inline-block">
              <span className="text-emerald-400">tension?</span>
            </span>
            <br />
            <span className="text-white/40">Chhod do.</span>
          </h1>

          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-12 leading-relaxed font-medium">
            Book private parking across Mumbai, Delhi, Bangalore & more —<br className="hidden md:block" />
            by the hour, day, or month. UPI payment. QR entry. Zero drama.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 bg-white/[0.06] rounded-xl px-4 py-3">
                <MapPin className="text-emerald-400 w-4 h-4 shrink-0" />
                <Input
                  placeholder="Mumbai, Delhi, Bangalore…"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto text-white placeholder:text-white/30 text-sm focus-visible:ring-0 shadow-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all gap-2"
              >
                <Search className="w-4 h-4" />
                Find Parking
              </Button>
            </div>
          </form>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {[
              { value: "500+", label: "Verified spots" },
              { value: "8", label: "Major cities" },
              { value: "₹50", label: "Starting / hour" },
              { value: "4.8★", label: "Avg. rating" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-black text-white">{value}</span>
                <span className="text-xs text-white/40 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">Handpicked for you</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">Top Rated Spots</h2>
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
      <section className="py-16 px-4 md:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Across India</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Browse by City</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {CITIES.map(({ city, emoji, spots, gradient, img }) => (
              <button
                key={city}
                onClick={() => setLocation(`/search?q=${city}`)}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] text-left"
              >
                {/* Background image */}
                <img
                  src={img}
                  alt={city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-70 transition-opacity`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="text-2xl mb-1 block">{emoji}</span>
                  <p className="font-bold text-white text-lg leading-tight">{city}</p>
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
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Kitna aasaan hai</h2>
            <p className="text-gray-400 mt-3 text-base">Park in 3 steps. No app needed. No cash needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                step: "01",
                title: "Search",
                desc: "Enter your city, pick your time and vehicle. See real spots, real prices, real reviews.",
                color: "from-emerald-400 to-teal-500",
                icon: <Search className="w-7 h-7 text-white" />,
              },
              {
                step: "02",
                title: "Pay Securely",
                desc: "UPI, PhonePe, GPay, or card. One tap checkout. Your money is safe, always.",
                color: "from-violet-500 to-purple-600",
                icon: <Zap className="w-7 h-7 text-white" />,
              },
              {
                step: "03",
                title: "Park & Go",
                desc: "Get your QR entry pass instantly. Show it at the gate. No cash, no stress.",
                color: "from-amber-400 to-orange-500",
                icon: <QrCode className="w-7 h-7 text-white" />,
              },
            ].map(({ step, title, desc, color, icon }, i) => (
              <div key={step} className="relative group">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%-1px)] w-full h-px bg-gradient-to-r from-gray-200 to-transparent z-10" />
                )}
                <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}>
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

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Why ParkBnB</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">India's smartest<br />parking app</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Search className="w-6 h-6" />, title: "Smart Search", desc: "Filter by city, time, price range and vehicle type in seconds", color: "text-emerald-400", bg: "bg-emerald-400/10" },
              { icon: <Zap className="w-6 h-6" />, title: "Instant UPI Pay", desc: "PhonePe, GPay, UPI ID, RuPay card — one seamless checkout", color: "text-amber-400", bg: "bg-amber-400/10" },
              { icon: <QrCode className="w-6 h-6" />, title: "QR Entry Pass", desc: "Digital pass delivered instantly. Just scan and park", color: "text-violet-400", bg: "bg-violet-400/10" },
              { icon: <Shield className="w-6 h-6" />, title: "Verified Spots", desc: "Every listing verified. Real reviews from real drivers", color: "text-cyan-400", bg: "bg-cyan-400/10" },
            ].map(({ icon, title, desc, color, bg }) => (
              <div key={title} className="border border-white/8 rounded-2xl p-7 hover:border-white/20 transition-colors bg-white/[0.03]">
                <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-5`}>
                  {icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOST CTA ───────────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gray-950 min-h-[420px] flex items-center">
            {/* Background texture */}
            <div className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.1) 0%, transparent 60%)" }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

            {/* Decorative shapes */}
            <div className="absolute right-12 top-12 w-64 h-64 rounded-full border border-emerald-500/10 hidden lg:block" />
            <div className="absolute right-24 top-24 w-40 h-40 rounded-full border border-emerald-500/10 hidden lg:block" />
            <div className="absolute right-36 top-36 w-20 h-20 rounded-full bg-emerald-500/10 hidden lg:block" />

            <div className="relative z-10 px-10 py-16 md:py-20 md:px-20 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 bg-emerald-400/10 px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> For Property Owners
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Apni parking se<br />
                <span className="text-emerald-400">₹15,000+</span><br />
                mahine kamaiye.
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-10">
                Got a driveway, garage, or unused plot? List it free in 5 minutes.<br />
                You set the price. You control availability. We handle the payments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full h-14 px-10 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base shadow-xl shadow-emerald-500/25 gap-2"
                  onClick={() => setLocation('/auth')}
                >
                  List Your Spot — Free <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-white/30 text-xs mt-5">No commission for first 90 days · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
