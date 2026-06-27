import { Router, type IRouter } from "express";
import { eq, and, gte, lte, desc, ilike, sql } from "drizzle-orm";
import { db, listingsTable, usersTable, favoritesTable } from "@workspace/db";
import { SearchListingsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

router.get("/search", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = SearchListingsQueryParams.safeParse(req.query);

  const conditions = [eq(listingsTable.status, "active")];

  if (params.success) {
    if (params.data.query) {
      conditions.push(
        sql`(${ilike(listingsTable.title, `%${params.data.query}%`)} OR ${ilike(listingsTable.city, `%${params.data.query}%`)} OR ${ilike(listingsTable.address, `%${params.data.query}%`)})`
      );
    }
    if (params.data.minPrice != null) {
      conditions.push(gte(listingsTable.hourlyRate, String(params.data.minPrice)));
    }
    if (params.data.maxPrice != null) {
      conditions.push(lte(listingsTable.hourlyRate, String(params.data.maxPrice)));
    }
    if (params.data.pricingType) {
      conditions.push(eq(listingsTable.pricingType, params.data.pricingType as "hourly" | "daily" | "monthly" | "all"));
    }
  }

  const listings = await db.select().from(listingsTable)
    .where(and(...conditions))
    .orderBy(desc(listingsTable.rating), desc(listingsTable.createdAt))
    .limit(24);

  const hosts = await db.select().from(usersTable);
  const hostMap = new Map(hosts.map(h => [h.id, h]));

  let favorites: number[] = [];
  if (userId) {
    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
    favorites = favs.map(f => f.listingId);
  }

  const formatted = listings.map(l => ({
    id: l.id,
    title: l.title,
    description: l.description ?? null,
    address: l.address,
    city: l.city,
    state: l.state ?? null,
    lat: l.lat ? parseFloat(l.lat) : null,
    lng: l.lng ? parseFloat(l.lng) : null,
    hostId: l.hostId,
    hostName: hostMap.get(l.hostId)?.name ?? null,
    hostAvatar: hostMap.get(l.hostId)?.avatar ?? null,
    hostRating: hostMap.get(l.hostId)?.rating ? parseFloat(hostMap.get(l.hostId)!.rating!) : null,
    hourlyRate: parseFloat(l.hourlyRate),
    dailyRate: l.dailyRate ? parseFloat(l.dailyRate) : null,
    monthlyRate: l.monthlyRate ? parseFloat(l.monthlyRate) : null,
    pricingType: l.pricingType,
    vehicleTypes: (l.vehicleTypes as string[]) ?? [],
    amenities: (l.amenities as string[]) ?? [],
    photos: (l.photos as string[]) ?? [],
    dimensions: l.dimensions ?? null,
    totalSpots: l.totalSpots,
    availableSpots: l.availableSpots,
    rating: l.rating ? parseFloat(l.rating) : null,
    reviewCount: l.reviewCount,
    status: l.status,
    isFavorited: favorites.includes(l.id),
    distance: null,
    createdAt: l.createdAt.toISOString(),
  }));

  res.json({
    listings: formatted,
    total: formatted.length,
    page: 1,
    limit: 24,
  });
});

router.get("/cities/popular", async (_req, res): Promise<void> => {
  const cities = await db.select({
    city: listingsTable.city,
    state: listingsTable.state,
    count: sql<number>`count(*)`,
    avgPrice: sql<number>`avg(cast(hourly_rate as float))`,
  }).from(listingsTable)
    .where(eq(listingsTable.status, "active"))
    .groupBy(listingsTable.city, listingsTable.state)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const cityImages: Record<string, string> = {
    "Mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400",
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400",
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
    "Chicago": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
    "Los Angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400",
    "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400",
  };

  res.json(cities.map(c => ({
    name: c.city,
    state: c.state ?? "",
    listingCount: Number(c.count),
    averagePrice: c.avgPrice ? Math.round(Number(c.avgPrice)) : null,
    imageUrl: cityImages[c.city] ?? null,
  })));
});

export default router;
