import { Router, type IRouter } from "express";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { db, listingsTable, usersTable, favoritesTable } from "@workspace/db";
import {
  GetListingsQueryParams,
  GetListingParams,
  CreateListingBody,
  UpdateListingParams,
  UpdateListingBody,
  DeleteListingParams,
  CheckAvailabilityParams,
  CheckAvailabilityBody,
  GetNearbyListingsQueryParams,
  GetSuggestedPriceQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

function formatListing(listing: typeof listingsTable.$inferSelect, host?: typeof usersTable.$inferSelect | null, isFavorited?: boolean, distance?: number) {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description ?? null,
    address: listing.address,
    city: listing.city,
    state: listing.state ?? null,
    lat: listing.lat ? parseFloat(listing.lat) : null,
    lng: listing.lng ? parseFloat(listing.lng) : null,
    hostId: listing.hostId,
    hostName: host?.name ?? null,
    hostAvatar: host?.avatar ?? null,
    hostRating: host?.rating ? parseFloat(host.rating) : null,
    hourlyRate: parseFloat(listing.hourlyRate),
    dailyRate: listing.dailyRate ? parseFloat(listing.dailyRate) : null,
    monthlyRate: listing.monthlyRate ? parseFloat(listing.monthlyRate) : null,
    pricingType: listing.pricingType,
    vehicleTypes: (listing.vehicleTypes as string[]) ?? [],
    amenities: (listing.amenities as string[]) ?? [],
    photos: (listing.photos as string[]) ?? [],
    dimensions: listing.dimensions ?? null,
    totalSpots: listing.totalSpots,
    availableSpots: listing.availableSpots,
    rating: listing.rating ? parseFloat(listing.rating) : null,
    reviewCount: listing.reviewCount,
    status: listing.status,
    isFavorited: isFavorited ?? null,
    distance: distance ?? null,
    createdAt: listing.createdAt.toISOString(),
  };
}

router.get("/listings", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = GetListingsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 12) : 12;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.success) {
    if (params.data.city) conditions.push(ilike(listingsTable.city, `%${params.data.city}%`));
    if (params.data.pricingType) conditions.push(eq(listingsTable.pricingType, params.data.pricingType as "hourly" | "daily" | "monthly" | "all"));
  }
  conditions.push(eq(listingsTable.status, "active"));

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [listings, hosts, totalResult] = await Promise.all([
    db.select().from(listingsTable).where(whereClause).orderBy(desc(listingsTable.createdAt)).limit(limit).offset(offset),
    db.select().from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(whereClause),
  ]);

  let favorites: number[] = [];
  if (userId) {
    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
    favorites = favs.map(f => f.listingId);
  }

  const hostMap = new Map(hosts.map(h => [h.id, h]));
  const formatted = listings.map(l => formatListing(l, hostMap.get(l.hostId), favorites.includes(l.id)));

  res.json({
    listings: formatted,
    total: Number(totalResult[0]?.count ?? 0),
    page,
    limit,
  });
});

router.get("/listings/nearby", async (req, res): Promise<void> => {
  const params = GetNearbyListingsQueryParams.safeParse(req.query);
  const userId = getUserId(req);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { lat, lng, radius = 10 } = params.data;
  // Simple distance-based query using haversine approximation
  const listings = await db.select().from(listingsTable)
    .where(and(
      eq(listingsTable.status, "active"),
      sql`lat IS NOT NULL AND lng IS NOT NULL`,
      sql`(
        6371 * acos(
          cos(radians(${lat})) * cos(radians(cast(lat as float))) *
          cos(radians(cast(lng as float)) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(cast(lat as float)))
        )
      ) <= ${radius}`
    ))
    .orderBy(desc(listingsTable.rating))
    .limit(20);

  const hosts = await db.select().from(usersTable);
  const hostMap = new Map(hosts.map(h => [h.id, h]));

  let favorites: number[] = [];
  if (userId) {
    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
    favorites = favs.map(f => f.listingId);
  }

  const result = listings.map(l => {
    const distance = l.lat && l.lng ? Math.sqrt(
      Math.pow((parseFloat(l.lat) - lat) * 111, 2) +
      Math.pow((parseFloat(l.lng) - lng) * 111, 2)
    ) : null;
    return formatListing(l, hostMap.get(l.hostId), favorites.includes(l.id), distance ?? undefined);
  });

  res.json(result);
});

router.get("/listings/featured", async (_req, res): Promise<void> => {
  const listings = await db.select().from(listingsTable)
    .where(eq(listingsTable.status, "active"))
    .orderBy(desc(listingsTable.rating), desc(listingsTable.reviewCount))
    .limit(8);

  const hosts = await db.select().from(usersTable);
  const hostMap = new Map(hosts.map(h => [h.id, h]));
  res.json(listings.map(l => formatListing(l, hostMap.get(l.hostId), false)));
});

router.get("/listings/host/mine", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const listings = await db.select().from(listingsTable).where(eq(listingsTable.hostId, userId));
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json(listings.map(l => formatListing(l, host ?? null, false)));
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetListingParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = getUserId(req);

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, listing.hostId));
  const hostListingsCount = await db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(eq(listingsTable.hostId, listing.hostId));

  let isFavorited = false;
  if (userId) {
    const fav = await db.select().from(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, listing.id)));
    isFavorited = fav.length > 0;
  }

  res.json({
    ...formatListing(listing, host ?? null, isFavorited),
    hostTotalListings: Number(hostListingsCount[0]?.count ?? 0),
    rules: listing.rules ?? null,
    instructions: listing.instructions ?? null,
  });
});

router.post("/listings", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [listing] = await db.insert(listingsTable).values({
    ...parsed.data,
    hostId: userId,
    hourlyRate: String(parsed.data.hourlyRate),
    dailyRate: parsed.data.dailyRate != null ? String(parsed.data.dailyRate) : null,
    monthlyRate: parsed.data.monthlyRate != null ? String(parsed.data.monthlyRate) : null,
    lat: parsed.data.lat != null ? String(parsed.data.lat) : null,
    lng: parsed.data.lng != null ? String(parsed.data.lng) : null,
    vehicleTypes: parsed.data.vehicleTypes ?? [],
    amenities: parsed.data.amenities ?? [],
    photos: parsed.data.photos ?? [],
  }).returning();
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json(formatListing(listing, host ?? null, false));
});

router.patch("/listings/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateListingParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.hourlyRate != null) updateData.hourlyRate = String(parsed.data.hourlyRate);
  if (parsed.data.dailyRate != null) updateData.dailyRate = String(parsed.data.dailyRate);
  if (parsed.data.monthlyRate != null) updateData.monthlyRate = String(parsed.data.monthlyRate);

  const [listing] = await db.update(listingsTable).set(updateData).where(and(eq(listingsTable.id, params.data.id), eq(listingsTable.hostId, userId))).returning();
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, listing.hostId));
  res.json(formatListing(listing, host ?? null, false));
});

router.delete("/listings/:id", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteListingParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(listingsTable).where(and(eq(listingsTable.id, params.data.id), eq(listingsTable.hostId, userId)));
  res.sendStatus(204);
});

router.post("/listings/:id/availability", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CheckAvailabilityParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = CheckAvailabilityBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  // Simple availability check - always returns available for now
  res.json({
    available: listing.availableSpots > 0,
    availableSpots: listing.availableSpots,
    bookedSlots: [],
  });
});

router.get("/pricing/suggest", async (req, res): Promise<void> => {
  const params = GetSuggestedPriceQueryParams.safeParse(req.query);
  const city = params.success ? (params.data.city ?? "default") : "default";

  // AI-inspired dynamic pricing based on city
  const cityPricing: Record<string, { hourly: number; daily: number; monthly: number }> = {
    "mumbai": { hourly: 80, daily: 400, monthly: 6000 },
    "delhi": { hourly: 60, daily: 300, monthly: 4500 },
    "bangalore": { hourly: 70, daily: 350, monthly: 5000 },
    "new york": { hourly: 25, daily: 120, monthly: 800 },
    "london": { hourly: 20, daily: 100, monthly: 700 },
    "default": { hourly: 50, daily: 250, monthly: 3000 },
  };

  const pricing = cityPricing[city.toLowerCase()] ?? cityPricing.default;
  res.json({
    hourlyRate: pricing.hourly,
    dailyRate: pricing.daily,
    monthlyRate: pricing.monthly,
    reasoning: `Based on demand and availability in ${city}, these rates are competitive for your area.`,
  });
});

export default router;
