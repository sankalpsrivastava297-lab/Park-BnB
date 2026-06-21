import { useState } from "react";
import { useCreateBooking } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Loader2,
  Shield,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  ChevronRight,
  Lock,
} from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  listingId: number;
  listingTitle: string;
  startDate: string;
  endDate: string;
  pricingType: string;
  vehicleType?: string;
  vehiclePlate?: string;
  onSuccess: (bookingId: number) => void;
}

type PayMethod = "upi" | "card" | "netbanking" | "wallet";
type Step = "choose" | "details" | "processing" | "success";

const BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Bank of Baroda", "Punjab National Bank", "Canara Bank"];
const WALLETS = [
  { name: "PhonePe", color: "#5f259f", letter: "P" },
  { name: "Google Pay", color: "#1a73e8", letter: "G" },
  { name: "Paytm", color: "#002970", letter: "P" },
  { name: "Amazon Pay", color: "#ff9900", letter: "A" },
];

function UpiQr({ amount, upiString }: { amount: number; upiString: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=8`;
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="bg-white rounded-2xl p-3 shadow-sm border">
        <img src={qrUrl} alt="UPI QR Code" width={180} height={180} className="rounded-lg" />
      </div>
      <p className="text-xs text-gray-500 text-center">Scan with any UPI app</p>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        {["PhonePe", "GPay", "BHIM", "Paytm"].map(app => (
          <span key={app} className="font-medium">{app}</span>
        ))}
      </div>
    </div>
  );
}

export function PaymentModal({
  open,
  onClose,
  amount,
  listingId,
  listingTitle,
  startDate,
  endDate,
  pricingType,
  vehicleType,
  vehiclePlate,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

  const [method, setMethod] = useState<PayMethod>("upi");
  const [step, setStep] = useState<Step>("choose");
  const [upiMode, setUpiMode] = useState<"qr" | "id">("qr");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const upiString = `upi://pay?pa=parkbnb@upi&pn=ParkBnB&am=${amount}&tn=Parking+Booking&cu=INR`;

  async function initiatePayment() {
    const userId = user?.id ? String(user.id) : null;
    if (!userId) return;

    const res = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ listingId, amount, pricingType, startDate, endDate, vehicleType, vehiclePlate }),
    });
    const data = await res.json();
    return data.paymentId as string;
  }

  async function processPayment() {
    try {
      setStep("processing");
      const pid = await initiatePayment();
      if (!pid) throw new Error("Failed to initiate payment");
      setPaymentId(pid);

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 2200));

      const userId = user?.id ? String(user.id) : null;
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId! },
        body: JSON.stringify({ paymentId: pid, method }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error("Payment verification failed");

      setTransactionId(verifyData.transactionId);

      // Create the booking
      let newBookingId: number | null = null;
      await new Promise<void>((resolve, reject) => {
        createBooking.mutate({
          data: {
            listingId,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            pricingType,
            totalPrice: amount,
            vehicleType: vehicleType || "Sedan",
            vehiclePlate: vehiclePlate || "",
          }
        }, {
          onSuccess: (data: any) => { newBookingId = data?.id ?? null; setCreatedBookingId(data?.id ?? null); resolve(); },
          onError: () => reject(new Error("Booking failed")),
        });
      });

      setStep("success");
    } catch (err) {
      setStep("choose");
      toast({ variant: "destructive", title: "Payment failed", description: "Please try again." });
    }
  }

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  }

  function canPay(): boolean {
    if (method === "upi") return upiMode === "qr" || upiId.includes("@");
    if (method === "card") return cardNumber.replace(/\s/g, "").length === 16 && cardExpiry.length === 5 && cardCvv.length >= 3 && cardName.length > 2;
    if (method === "netbanking") return !!selectedBank;
    if (method === "wallet") return !!selectedWallet;
    return false;
  }

  const handleClose = () => {
    if (step === "processing") return;
    setStep("choose");
    setMethod("upi");
    setUpiId("");
    setCardNumber(""); setCardExpiry(""); setCardCvv(""); setCardName("");
    setSelectedBank(""); setSelectedWallet("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <DialogTitle className="text-white text-base font-semibold">Complete Payment</DialogTitle>
            <Badge variant="secondary" className="bg-white/10 text-white border-0 text-xs gap-1">
              <Lock className="h-2.5 w-2.5" /> 256-bit SSL
            </Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">₹{amount.toFixed(0)}</span>
          </div>
          <p className="text-gray-400 text-xs mt-1 truncate">{listingTitle}</p>
        </div>

        {/* Processing state */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-lg">Processing Payment</p>
              <p className="text-gray-500 text-sm mt-1">Please do not close this window</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Secured by ParkBnB Pay
            </div>
          </div>
        )}

        {/* Success state */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-xl">Payment Successful!</p>
              <p className="text-gray-500 text-sm mt-1">Your parking spot is confirmed</p>
            </div>
            <div className="w-full bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold text-gray-900">₹{amount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-gray-700">{transactionId.slice(0, 20)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">{method === "upi" ? "UPI" : method === "netbanking" ? selectedBank : method === "wallet" ? selectedWallet : "Card"}</span>
              </div>
            </div>
            <Button className="w-full rounded-xl" onClick={() => { onSuccess(createdBookingId!); handleClose(); }}>
              View My Booking
            </Button>
          </div>
        )}

        {/* Choose / Details state */}
        {(step === "choose" || step === "details") && (
          <div className="flex">
            {/* Method sidebar */}
            <div className="w-32 border-r bg-gray-50 shrink-0 py-3">
              {([ 
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "card", label: "Card", icon: CreditCard },
                { id: "netbanking", label: "Net Banking", icon: Building2 },
                { id: "wallet", label: "Wallets", icon: Wallet },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setMethod(id); setStep("choose"); }}
                  className={cn(
                    "w-full flex flex-col items-center gap-1.5 py-3 px-2 text-xs font-medium transition-colors",
                    method === id
                      ? "bg-white text-primary border-r-2 border-primary"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  <Icon className={cn("h-5 w-5", method === id ? "text-primary" : "text-gray-400")} />
                  {label}
                </button>
              ))}
            </div>

            {/* Method content */}
            <div className="flex-1 p-5 overflow-y-auto max-h-[420px]">

              {/* UPI */}
              {method === "upi" && (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setUpiMode("qr")}
                      className={cn("flex-1 text-sm py-1.5 rounded-lg font-medium border transition-colors",
                        upiMode === "qr" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"
                      )}
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => setUpiMode("id")}
                      className={cn("flex-1 text-sm py-1.5 rounded-lg font-medium border transition-colors",
                        upiMode === "id" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"
                      )}
                    >
                      UPI ID
                    </button>
                  </div>

                  {upiMode === "qr" ? (
                    <UpiQr amount={amount} upiString={upiString} />
                  ) : (
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-gray-700">Enter UPI ID</Label>
                      <Input
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="rounded-xl"
                      />
                      <p className="text-xs text-gray-400">e.g. name@okaxis, name@ybl, name@paytm</p>
                    </div>
                  )}
                </div>
              )}

              {/* Card */}
              {method === "card" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1 block">Card Number</Label>
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      className="rounded-xl font-mono tracking-wider"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1 block">Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        className="rounded-xl"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1 block">CVV</Label>
                      <Input
                        placeholder="•••"
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="rounded-xl"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1 block">Name on Card</Label>
                    <Input
                      placeholder="As printed on card"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    Visa, Mastercard, RuPay accepted
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {method === "netbanking" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Select your bank</p>
                  <div className="grid grid-cols-1 gap-2">
                    {BANKS.map(bank => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left",
                          selectedBank === bank
                            ? "bg-primary/5 border-primary text-primary"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {bank}
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallets */}
              {method === "wallet" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Select wallet</p>
                  <div className="grid grid-cols-2 gap-3">
                    {WALLETS.map(({ name, color, letter }) => (
                      <button
                        key={name}
                        onClick={() => setSelectedWallet(name)}
                        className={cn(
                          "flex flex-col items-center gap-2 py-4 px-3 rounded-xl border font-medium text-sm transition-all",
                          selectedWallet === name
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: color }}
                        >
                          {letter}
                        </div>
                        <span className={cn("text-xs", selectedWallet === name ? "text-primary" : "text-gray-700")}>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer pay button */}
        {step === "choose" && (
          <div className="border-t px-5 py-4 bg-white">
            <Button
              className="w-full rounded-xl h-12 text-base font-bold"
              onClick={processPayment}
              disabled={!canPay()}
            >
              {method === "upi" && upiMode === "qr"
                ? `Pay ₹${amount.toFixed(0)} via UPI QR`
                : `Pay ₹${amount.toFixed(0)}`}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Secured by ParkBnB · No hidden charges
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
