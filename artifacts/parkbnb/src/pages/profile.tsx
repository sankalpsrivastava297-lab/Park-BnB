import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useMode } from "@/components/layout";
import { useUpdateMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera, Car, Home, CheckCircle2, Clock, AlertCircle, ArrowRight
} from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified";

type DriverIdentity = {
  vehicleType: string;
  vehiclePlate: string;
  licenseNumber: string;
  status: VerificationStatus;
};

type HostIdentity = {
  panNumber: string;
  bankAccountNumber: string;
  bankIfsc: string;
  gstNumber: string;
  status: VerificationStatus;
};

const DEFAULT_DRIVER: DriverIdentity = {
  vehicleType: "", vehiclePlate: "", licenseNumber: "", status: "unverified",
};
const DEFAULT_HOST: HostIdentity = {
  panNumber: "", bankAccountNumber: "", bankIfsc: "", gstNumber: "", status: "unverified",
};

function loadLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { icon: React.ReactNode; label: string; cls: string }> = {
    verified:   { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Verified",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending:    { icon: <Clock className="w-3.5 h-3.5" />,        label: "Under Review", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    unverified: { icon: <AlertCircle className="w-3.5 h-3.5" />,  label: "Not Verified", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const { icon, label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cls}`}>
      {icon} {label}
    </span>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mode, setMode } = useMode();
  const [, setLocation] = useLocation();
  const updateMe = useUpdateMe();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [driver, setDriver] = useState<DriverIdentity>(DEFAULT_DRIVER);
  const [host, setHost] = useState<HostIdentity>(DEFAULT_HOST);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      const savedDriver = loadLocal<DriverIdentity>(`parkbnb_driver_${user.id}`, DEFAULT_DRIVER);
      if (user.vehicleType && !savedDriver.vehicleType) savedDriver.vehicleType = user.vehicleType;
      if (user.vehiclePlate && !savedDriver.vehiclePlate) savedDriver.vehiclePlate = user.vehiclePlate;
      setDriver(savedDriver);
      setHost(loadLocal<HostIdentity>(`parkbnb_host_${user.id}`, DEFAULT_HOST));
    }
  }, [user]);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMe.mutate({ data: { name, phone } }, {
      onSuccess: () => toast({ title: "Profile saved" }),
      onError: () => toast({ variant: "destructive", title: "Could not save profile" }),
    });
  };

  const saveDriverIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: DriverIdentity = {
      ...driver,
      status: driver.vehiclePlate && driver.licenseNumber ? "pending" : "unverified",
    };
    localStorage.setItem(`parkbnb_driver_${user.id}`, JSON.stringify(updated));
    updateMe.mutate({ data: { vehicleType: driver.vehicleType, vehiclePlate: driver.vehiclePlate } }, {
      onSuccess: () => {
        setDriver(updated);
        toast({
          title: "Driver profile saved",
          description: updated.status === "pending" ? "We'll verify your details within 24 hrs." : undefined,
        });
      },
      onError: () => toast({ variant: "destructive", title: "Could not save driver identity" }),
    });
  };

  const saveHostIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: HostIdentity = {
      ...host,
      status: host.panNumber && host.bankAccountNumber && host.bankIfsc ? "pending" : "unverified",
    };
    localStorage.setItem(`parkbnb_host_${user.id}`, JSON.stringify(updated));
    setHost(updated);
    toast({
      title: "Host profile saved",
      description: updated.status === "pending" ? "Verification usually takes 48 hrs." : undefined,
    });
  };

  const switchToHost = () => {
    setMode("host");
    setLocation("/profile");
  };

  const switchToDriver = () => {
    setMode("driver");
    setLocation("/profile");
  };

  if (!user) return null;

  const initials = user.name?.substring(0, 2).toUpperCase() || "PB";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {mode === "driver" ? "Driver Profile" : "Host Profile"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {mode === "driver"
                  ? "Manage your personal details and driver verification."
                  : "Manage your personal details and host payout information."}
              </p>
            </div>
            {/* Role badge */}
            <div className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide border flex items-center gap-2 ${
              mode === "driver"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-violet-50 text-violet-700 border-violet-200"
            }`}>
              {mode === "driver" ? <Car className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
              {mode === "driver" ? "Driver" : "Host"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-5">

        {/* ── Account Card ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`px-6 pt-8 pb-14 relative ${
            mode === "driver"
              ? "bg-gradient-to-r from-blue-500 to-blue-600"
              : "bg-gradient-to-r from-violet-500 to-violet-600"
          }`}>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide">
              {mode === "driver" ? "Driver Account" : "Host Account"}
            </p>
            <p className="text-white font-extrabold text-xl mt-0.5">{user.name}</p>
          </div>
          <div className="px-6 pb-6 -mt-8">
            <div className="flex items-end gap-5 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback className={`text-2xl font-extrabold ${
                    mode === "driver" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"
                  }`}>{initials}</AvatarFallback>
                </Avatar>
                <button className={`absolute -bottom-1 -right-1 p-1.5 text-white rounded-full shadow-md transition-colors ${
                  mode === "driver" ? "bg-blue-500 hover:bg-blue-600" : "bg-violet-500 hover:bg-violet-600"
                }`}>
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mb-1 flex gap-2 flex-wrap">
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                  ID #{user.id}
                </span>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="rounded-xl" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={updateMe.isPending}
                className={`rounded-full font-bold shadow-md ${
                  mode === "driver"
                    ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                    : "bg-violet-500 hover:bg-violet-600 shadow-violet-500/20"
                } text-white`}
              >
                {updateMe.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>

        {/* ── Driver Identity (only in driver mode) ───────── */}
        {mode === "driver" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-base">Driver Verification</p>
                  <p className="text-gray-400 text-xs mt-0.5">Vehicle & license — required to book parking spots</p>
                </div>
              </div>
              <StatusBadge status={driver.status} />
            </div>

            <div className="p-5">
              {driver.status === "unverified" && (
                <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">Complete driver verification to book spots</p>
                    <p className="text-xs text-blue-600 mt-0.5">Your license and plate number are verified before your first booking is confirmed. Takes up to 24 hours.</p>
                  </div>
                </div>
              )}
              {driver.status === "pending" && (
                <div className="mb-5 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">Your driver identity is under review. You can still browse spots — bookings will be confirmed once verified.</p>
                </div>
              )}
              {driver.status === "verified" && (
                <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 font-semibold">You're a verified driver. All spots are open for booking.</p>
                </div>
              )}

              <form onSubmit={saveDriverIdentity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Vehicle Type / Model</Label>
                    <Input
                      placeholder="e.g. Maruti Swift, Honda City"
                      value={driver.vehicleType}
                      onChange={e => setDriver(d => ({ ...d, vehicleType: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Number Plate <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. MH12AB1234"
                      value={driver.vehiclePlate}
                      onChange={e => setDriver(d => ({ ...d, vehiclePlate: e.target.value.toUpperCase() }))}
                      className="rounded-xl font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Driving License Number <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. MH-1234567890123"
                    value={driver.licenseNumber}
                    onChange={e => setDriver(d => ({ ...d, licenseNumber: e.target.value.toUpperCase() }))}
                    className="rounded-xl font-mono"
                  />
                  <p className="text-[11px] text-gray-400">Encrypted and used only for one-time identity verification.</p>
                </div>
                <Button type="submit" disabled={updateMe.isPending} className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold">
                  Save Driver Details
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── Host Identity (only in host mode) ───────────── */}
        {mode === "host" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-base">Host Verification</p>
                  <p className="text-gray-400 text-xs mt-0.5">PAN, bank account & GST — required to receive payouts</p>
                </div>
              </div>
              <StatusBadge status={host.status} />
            </div>

            <div className="p-5">
              {host.status === "unverified" && (
                <div className="mb-5 bg-violet-50 border border-violet-100 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-violet-800">Complete host verification to receive payouts</p>
                    <p className="text-xs text-violet-600 mt-0.5">You can list spots immediately, but your earnings will be held until your bank and PAN are verified (up to 48 hours).</p>
                  </div>
                </div>
              )}
              {host.status === "pending" && (
                <div className="mb-5 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">Your host identity is under review. Payouts will begin once verified (up to 48 hrs).</p>
                </div>
              )}
              {host.status === "verified" && (
                <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 font-semibold">You're a verified host. Payouts are enabled to your bank account.</p>
                </div>
              )}

              <form onSubmit={saveHostIdentity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      PAN Number <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. ABCDE1234F"
                      value={host.panNumber}
                      onChange={e => setHost(h => ({ ...h, panNumber: e.target.value.toUpperCase() }))}
                      className="rounded-xl font-mono"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">GST Number (optional)</Label>
                    <Input
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={host.gstNumber}
                      onChange={e => setHost(h => ({ ...h, gstNumber: e.target.value.toUpperCase() }))}
                      className="rounded-xl font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Bank Account Number <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="Your savings account number"
                      value={host.bankAccountNumber}
                      onChange={e => setHost(h => ({ ...h, bankAccountNumber: e.target.value }))}
                      className="rounded-xl font-mono"
                      type="password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      IFSC Code <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. HDFC0001234"
                      value={host.bankIfsc}
                      onChange={e => setHost(h => ({ ...h, bankIfsc: e.target.value.toUpperCase() }))}
                      className="rounded-xl font-mono"
                      maxLength={11}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Your account number is encrypted and used only to transfer your earnings.</p>
                <Button type="submit" className="rounded-full bg-violet-500 hover:bg-violet-600 text-white font-bold">
                  Save Host Details
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── Cross-role CTA ──────────────────────────────── */}
        {mode === "driver" && (
          <div className="bg-gradient-to-r from-violet-50 to-violet-100 border border-violet-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-200 rounded-2xl flex items-center justify-center text-2xl shrink-0">🏠</div>
              <div>
                <p className="font-extrabold text-violet-900 text-base">Got a parking spot? Earn from it.</p>
                <p className="text-violet-600 text-sm mt-0.5">Switch to Host mode to list your driveway, garage, or plot and start earning ₹15,000+/month.</p>
              </div>
            </div>
            <Button
              onClick={switchToHost}
              className="rounded-full bg-violet-500 hover:bg-violet-600 text-white font-bold shrink-0 gap-2 shadow-md shadow-violet-500/20"
            >
              Go to Host Profile <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {mode === "host" && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-200 rounded-2xl flex items-center justify-center text-2xl shrink-0">🚗</div>
              <div>
                <p className="font-extrabold text-blue-900 text-base">Need parking yourself?</p>
                <p className="text-blue-600 text-sm mt-0.5">Switch to Driver mode to verify your vehicle and book parking spots across India.</p>
              </div>
            </div>
            <Button
              onClick={switchToDriver}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold shrink-0 gap-2 shadow-md shadow-blue-500/20"
            >
              Go to Driver Profile <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          🔒 Your sensitive details are encrypted and never shared with other users.
          Driver and Host identities are verified independently.
        </p>
      </div>
    </div>
  );
}
