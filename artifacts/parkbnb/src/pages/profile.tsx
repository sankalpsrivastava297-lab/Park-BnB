import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera, User, Car, Home, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp
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

const DEFAULT_DRIVER: DriverIdentity = { vehicleType: "", vehiclePlate: "", licenseNumber: "", status: "unverified" };
const DEFAULT_HOST: HostIdentity = { panNumber: "", bankAccountNumber: "", bankIfsc: "", gstNumber: "", status: "unverified" };

function loadLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { icon: React.ReactNode; label: string; cls: string }> = {
    verified:   { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Verified",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending:    { icon: <Clock className="w-3.5 h-3.5" />,        label: "Pending",    cls: "bg-amber-100 text-amber-700 border-amber-200" },
    unverified: { icon: <AlertCircle className="w-3.5 h-3.5" />,  label: "Unverified", cls: "bg-gray-100 text-gray-500 border-gray-200" },
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
  const updateMe = useUpdateMe();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [driverOpen, setDriverOpen] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const [driver, setDriver] = useState<DriverIdentity>(DEFAULT_DRIVER);
  const [host, setHost] = useState<HostIdentity>(DEFAULT_HOST);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      const savedDriver = loadLocal<DriverIdentity>(`parkbnb_driver_${user.id}`, DEFAULT_DRIVER);
      if (user.vehicleType) savedDriver.vehicleType = savedDriver.vehicleType || user.vehicleType;
      if (user.vehiclePlate) savedDriver.vehiclePlate = savedDriver.vehiclePlate || user.vehiclePlate;
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
        toast({ title: "Driver profile saved", description: updated.status === "pending" ? "Verification usually takes 24 hrs." : undefined });
      },
      onError: () => toast({ variant: "destructive", title: "Could not save driver identity" }),
    });
  };

  const saveHostIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: HostIdentity = {
      ...host,
      status: host.panNumber && host.bankAccountNumber ? "pending" : "unverified",
    };
    localStorage.setItem(`parkbnb_host_${user.id}`, JSON.stringify(updated));
    setHost(updated);
    toast({ title: "Host profile saved", description: updated.status === "pending" ? "Verification usually takes 48 hrs." : undefined });
  };

  if (!user) return null;

  const initials = user.name?.substring(0, 2).toUpperCase() || "PB";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Your Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal info, driver identity, and host identity separately.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-5">

        {/* ── Account Card ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 pt-8 pb-14 relative">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Account</p>
            <p className="text-white font-extrabold text-xl mt-0.5">{user.name}</p>
          </div>
          <div className="px-6 pb-6 -mt-8">
            <div className="flex items-end gap-5 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback className="text-2xl font-extrabold bg-emerald-100 text-emerald-700">{initials}</AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-full shadow-md hover:bg-emerald-600 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mb-1 flex gap-2 flex-wrap">
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                  ID #{user.id}
                </span>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                  {user.email || user.name?.toLowerCase().replace(/\s/g, ".") + "@user.com"}
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
              <Button type="submit" disabled={updateMe.isPending} className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
                {updateMe.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>

        {/* ── Driver Identity ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
            onClick={() => setDriverOpen(o => !o)}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-base">Driver Identity</p>
                <p className="text-gray-400 text-xs mt-0.5">Vehicle & license details for parking bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={driver.status} />
              {driverOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </button>

          {driverOpen && (
            <div className="px-5 pb-6 border-t border-gray-50">
              {driver.status === "unverified" && (
                <div className="my-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">Complete driver verification</p>
                    <p className="text-xs text-blue-600 mt-0.5">Fill in your vehicle and license details to book parking spots. Verification takes up to 24 hours.</p>
                  </div>
                </div>
              )}
              {driver.status === "pending" && (
                <div className="my-4 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">Your driver identity is under review. You can still book spots while we verify.</p>
                </div>
              )}
              <form onSubmit={saveDriverIdentity} className="mt-4 space-y-4">
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
                      Vehicle Number Plate <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. MH12 AB 1234"
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
                  <p className="text-[11px] text-gray-400">Your license number is encrypted and used only for verification.</p>
                </div>
                <Button type="submit" disabled={updateMe.isPending} className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold">
                  Save Driver Identity
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* ── Host Identity ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
            onClick={() => setHostOpen(o => !o)}
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-extrabold text-gray-900 text-base">Host Identity</p>
                <p className="text-gray-400 text-xs mt-0.5">PAN, bank account & GST for receiving payouts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={host.status} />
              {hostOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </button>

          {hostOpen && (
            <div className="px-5 pb-6 border-t border-gray-50">
              {host.status === "unverified" && (
                <div className="my-4 bg-violet-50 border border-violet-100 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-violet-800">Complete host verification to receive payouts</p>
                    <p className="text-xs text-violet-600 mt-0.5">You can list spots immediately, but payouts will be held until your host identity is verified (up to 48 hours).</p>
                  </div>
                </div>
              )}
              {host.status === "pending" && (
                <div className="my-4 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">Your host identity is under review. Payouts will be released once verified (48 hrs).</p>
                </div>
              )}
              <form onSubmit={saveHostIdentity} className="mt-4 space-y-4">
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Bank Account Number <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. 0123456789012"
                    value={host.bankAccountNumber}
                    onChange={e => setHost(h => ({ ...h, bankAccountNumber: e.target.value }))}
                    className="rounded-xl font-mono"
                    type="password"
                  />
                  <p className="text-[11px] text-gray-400">Account number is encrypted and used only to transfer your earnings.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Bank IFSC Code <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. HDFC0001234"
                    value={host.bankIfsc}
                    onChange={e => setHost(h => ({ ...h, bankIfsc: e.target.value.toUpperCase() }))}
                    className="rounded-xl font-mono"
                    maxLength={11}
                  />
                </div>
                <Button type="submit" className="rounded-full bg-violet-500 hover:bg-violet-600 text-white font-bold">
                  Save Host Identity
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-gray-400 pb-4">
          🔒 Your sensitive details are encrypted and never shared with other users.
          Driver and Host identities are verified independently — you can be both.
        </p>
      </div>
    </div>
  );
}
