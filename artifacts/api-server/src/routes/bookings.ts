import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, bookingsTable, listingsTable, usersTable } from "@workspace/db";
import {
  CreateBookingBody,
  GetBookingParams,
  CancelBookingParams,
  ConfirmBookingParams,
  GetMyBookingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

function generateQrCode(bookingId: number): string {
  return `PARKBNB-${bookingId}-${Date.now()}`;
}

function formatBooking(
  booking: typeof bookingsTable.$inferSelect,
  listing?: typeof listingsTable.$inferSelect | null,
  driver?: typeof usersTable.$inferSelect | null,
) {
  return {
    id: booking.id,
    listingId: booking.listingId,
    listingTitle: listing?.title ?? null,
    listingAddress: listing?.address ?? null,
    listingPhoto: listing?.photos ? ((listing.photos as string[])[0] ?? null) : null,
    driverId: booking.driverId,
    driverName: driver?.name ?? null,
    driverAvatar: driver?.avatar ?? null,
    hostId: booking.hostId,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    pricingType: booking.pricingType,
    totalPrice: parseFloat(booking.totalPrice),
    status: booking.status,
    qrCode: booking.qrCode ?? null,
    vehicleType: booking.vehicleType ?? null,
    vehiclePlate: booking.vehiclePlate ?? null,
    notes: booking.notes ?? null,
    createdAt: booking.createdAt.toISOString(),
  };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetMyBookingsQueryParams.safeParse(req.query);
  const role = params.success ? params.data.role : "driver";
  const status = params.success ? params.data.status : undefined;

  const conditions = [
    role === "host" ? eq(bookingsTable.hostId, userId) : eq(bookingsTable.driverId, userId),
  ];
  if (status) {
    conditions.push(eq(bookingsTable.status, status as "pending" | "confirmed" | "active" | "completed" | "cancelled"));
  }

  const bookings = await db.select().from(bookingsTable).where(and(...conditions));
  const [listings, users] = await Promise.all([
    db.select().from(listingsTable),
    db.select().from(usersTable),
  ]);
  const listingMap = new Map(listings.map(l => [l.id, l]));
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(bookings.map(b => formatBooking(b, listingMap.get(b.listingId), userMap.get(b.driverId))));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parsed.data.listingId));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const [booking] = await db.insert(bookingsTable).values({
    listingId: parsed.data.listingId,
    driverId: userId,
    hostId: listing.hostId,
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
    pricingType: parsed.data.pricingType,
    totalPrice: String(parsed.data.totalPrice),
    status: "pending",
    vehicleType: parsed.data.vehicleType ?? null,
    vehiclePlate: parsed.data.vehiclePlate ?? null,
    notes: parsed.data.notes ?? null,
  }).returning();

  // Generate QR code after creating booking
  const [updatedBooking] = await db.update(bookingsTable)
    .set({ qrCode: generateQrCode(booking.id), status: "confirmed" })
    .where(eq(bookingsTable.id, booking.id))
    .returning();

  const [driver] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json(formatBooking(updatedBooking, listing, driver));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBookingParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const [[listing], [driver]] = await Promise.all([
    db.select().from(listingsTable).where(eq(listingsTable.id, booking.listingId)),
    db.select().from(usersTable).where(eq(usersTable.id, booking.driverId)),
  ]);
  res.json(formatBooking(booking, listing ?? null, driver ?? null));
});

router.post("/bookings/:id/cancel", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CancelBookingParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [booking] = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(and(eq(bookingsTable.id, params.data.id), or(eq(bookingsTable.driverId, userId), eq(bookingsTable.hostId, userId))))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const [[listing], [driver]] = await Promise.all([
    db.select().from(listingsTable).where(eq(listingsTable.id, booking.listingId)),
    db.select().from(usersTable).where(eq(usersTable.id, booking.driverId)),
  ]);
  res.json(formatBooking(booking, listing ?? null, driver ?? null));
});

router.post("/bookings/:id/confirm", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ConfirmBookingParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [booking] = await db.update(bookingsTable)
    .set({ status: "confirmed" })
    .where(and(eq(bookingsTable.id, params.data.id), eq(bookingsTable.hostId, userId)))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const [[listing], [driver]] = await Promise.all([
    db.select().from(listingsTable).where(eq(listingsTable.id, booking.listingId)),
    db.select().from(usersTable).where(eq(usersTable.id, booking.driverId)),
  ]);
  res.json(formatBooking(booking, listing ?? null, driver ?? null));
});

export default router;
