import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, favoritesTable, listingsTable, usersTable } from "@workspace/db";
import { ToggleFavoriteParams } from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

router.get("/favorites", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const favorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
  const listingIds = favorites.map(f => f.listingId);

  if (listingIds.length === 0) {
    res.json([]);
    return;
  }

  const listings = await db.select().from(listingsTable);
  const hosts = await db.select().from(usersTable);
  const hostMap = new Map(hosts.map(h => [h.id, h]));

  const favListings = listings.filter(l => listingIds.includes(l.id));
  res.json(favListings.map(l => ({
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
    isFavorited: true,
    distance: null,
    createdAt: l.createdAt.toISOString(),
  })));
});

router.post("/favorites/:listingId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rawId = Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId;
  const params = ToggleFavoriteParams.safeParse({ listingId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const existing = await db.select().from(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, params.data.listingId)));

  if (existing.length > 0) {
    await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, params.data.listingId)));
    res.json({ favorited: false });
  } else {
    await db.insert(favoritesTable).values({ userId, listingId: params.data.listingId });
    res.json({ favorited: true });
  }
});

export default router;
