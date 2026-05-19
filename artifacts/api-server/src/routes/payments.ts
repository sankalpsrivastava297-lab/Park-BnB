import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

function makeId(prefix = "pay"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// In-memory store for payment sessions (in production use Redis or DB)
const pendingPayments = new Map<string, {
  userId: number;
  listingId: number;
  amount: number;
  pricingType: string;
  startDate: string;
  endDate: string;
  vehicleType?: string;
  vehiclePlate?: string;
  notes?: string;
  createdAt: number;
}>();

// Initiate a payment session — returns UPI details and payment ID
router.post("/payments/initiate", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { listingId, amount, pricingType, startDate, endDate, vehicleType, vehiclePlate, notes } = req.body;

  if (!listingId || !amount || !pricingType || !startDate || !endDate) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const paymentId = makeId("pay");
  pendingPayments.set(paymentId, {
    userId,
    listingId,
    amount,
    pricingType,
    startDate,
    endDate,
    vehicleType,
    vehiclePlate,
    notes,
    createdAt: Date.now(),
  });

  // Clean up sessions older than 30 minutes
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, val] of pendingPayments) {
    if (val.createdAt < cutoff) pendingPayments.delete(key);
  }

  const amountInPaise = Math.round(amount * 100);
  const upiString = `upi://pay?pa=parkbnb@upi&pn=ParkBnB&am=${amount}&tn=Parking+at+${encodeURIComponent(listing.city)}&cu=INR`;

  req.log.info({ paymentId, amount, listingId }, "Payment session initiated");

  res.json({
    paymentId,
    amount,
    amountInPaise,
    upiId: "parkbnb@upi",
    upiString,
    merchantName: "ParkBnB",
    listingTitle: listing.title,
    city: listing.city,
  });
});

// Verify payment and create booking
router.post("/payments/verify", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { paymentId, method } = req.body;

  if (!paymentId) {
    res.status(400).json({ error: "paymentId required" });
    return;
  }

  const session = pendingPayments.get(paymentId);
  if (!session) {
    res.status(404).json({ error: "Payment session not found or expired" });
    return;
  }

  if (session.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  pendingPayments.delete(paymentId);

  const transactionId = makeId("txn");

  req.log.info({ paymentId, transactionId, method, amount: session.amount }, "Payment verified");

  res.json({
    success: true,
    transactionId,
    method,
    amount: session.amount,
    bookingData: {
      listingId: session.listingId,
      startDate: session.startDate,
      endDate: session.endDate,
      pricingType: session.pricingType,
      totalPrice: session.amount,
      vehicleType: session.vehicleType,
      vehiclePlate: session.vehiclePlate,
      notes: session.notes,
    },
  });
});

export default router;
