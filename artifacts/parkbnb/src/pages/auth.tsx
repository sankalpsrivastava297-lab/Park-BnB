import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Star, Shield, Zap, MapPin } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState("driver");
  const registerUser = useRegisterUser();

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login("1");
      toast({ title: "Welcome back!", description: "You're now logged in to ParkBnB." });
      setLocation("/");
      setIsLoading(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    registerUser.mutate({
      data: {
        email: formData.get("email") as string,
        name: formData.get("name") as string,
        role: formData.get("role") as string,
      },
    }, {
      onSuccess: (user) => {
        login(user.id.toString());
        toast({ title: "Welcome to ParkBnB! 🎉", description: "Your account is ready." });
        setLocation("/");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to create account. Please try again." });
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden p-12">
        {/* Atmospheric orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute -bottom-40 right-0 w-[400px] h-[400px] rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-500/30">
              P
            </div>
            <span className="text-white font-bold text-xl">ParkBnB</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            India ki<br />
            <span className="text-emerald-400">parking</span><br />
            problem,<br />
            solved.
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Book private parking in Mumbai, Delhi, Bangalore & more. Instant UPI payment. QR entry pass. No more stress.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4 my-12">
          {[
            { value: "500+", label: "Verified spots" },
            { value: "8", label: "Cities" },
            { value: "₹50", label: "Starting /hr" },
          ].map(({ value, label }) => (
            <div key={label} className="border border-white/10 rounded-2xl p-4 bg-white/[0.03]">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: <Zap className="w-4 h-4 text-amber-400" />, text: "Instant UPI / GPay / PhonePe checkout" },
            { icon: <Shield className="w-4 h-4 text-emerald-400" />, text: "Secure QR entry pass on your phone" },
            { icon: <MapPin className="w-4 h-4 text-violet-400" />, text: "Real-time availability across India" },
            { icon: <Star className="w-4 h-4 text-rose-400" />, text: "Verified hosts, genuine reviews" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/60 text-sm">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{icon}</div>
              {text}
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-10 border border-white/10 rounded-2xl p-5 bg-white/[0.03]">
          <div className="flex gap-0.5 mb-3">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-white/70 text-sm leading-relaxed italic">
            "Found a covered spot near BKC in 2 minutes. Paid with GPay, got a QR code instantly. Never going back to searching for parking again."
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">R</div>
            <div>
              <p className="text-white/80 text-xs font-semibold">Rahul S.</p>
              <p className="text-white/30 text-[10px]">Mumbai, Driver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-lg">P</div>
            <span className="text-gray-900 font-bold text-lg">ParkBnB</span>
          </div>

          {/* Tab header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-gray-500 text-sm">
              {tab === "login"
                ? "Log in to book or manage your parking spots."
                : "Join 10,000+ Indians who park smarter."}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleMockLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  defaultValue="demo@parkbnb.com"
                  className="h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 bg-gray-50 focus-visible:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                  <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  defaultValue="password"
                  className="h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 bg-gray-50 focus-visible:bg-white transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 gap-2"
                disabled={isLoading}
              >
                {isLoading ? "Logging in…" : <>Log In <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                <Input
                  id="reg-name"
                  name="name"
                  placeholder="Rahul Sharma"
                  required
                  className="h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 bg-gray-50 focus-visible:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-sm font-semibold text-gray-700">Email address</Label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="h-12 rounded-xl border-gray-200 focus-visible:ring-emerald-500 bg-gray-50 focus-visible:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">I want to…</Label>
                <input type="hidden" name="role" value={selectedRole} />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "driver", label: "🚗 Park", sub: "Find spots" },
                    { value: "host", label: "🏠 Host", sub: "Earn money" },
                    { value: "both", label: "✨ Both", sub: "Park & earn" },
                  ].map(({ value, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedRole(value)}
                      className={`rounded-xl p-3 text-center transition-all border-2 ${
                        selectedRole === value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                    >
                      <p className="font-bold text-gray-900 text-sm">{label}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 gap-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account…" : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google button */}
          <button
            onClick={handleMockLogin}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition-all font-semibold text-sm text-gray-700 shadow-sm hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-600">Terms</a> and{" "}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>

          {/* Tab switch hint */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {tab === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => setTab("register")} className="text-emerald-600 font-semibold hover:text-emerald-700">Sign up free</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setTab("login")} className="text-emerald-600 font-semibold hover:text-emerald-700">Log in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
