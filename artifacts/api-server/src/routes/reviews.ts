import { Router, type IRouter } from "express";
import { eq, avg, sql } from "drizzle-orm";
import { db, reviewsTable, usersTable, listingsTable } from "@workspace/db";
import {
  CreateReviewBody,
  GetListingReviewsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

router.post("/reviews", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db.insert(reviewsTable).values({
    listingId: parsed.data.listingId,
    bookingId: parsed.data.bookingId ?? null,
    reviewerId: userId,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  }).returning();

  // Update listing rating
  const [ratingResult] = await db.select({
    avg: avg(reviewsTable.rating),
    count: sql<number>`count(*)`,
  }).from(reviewsTable).where(eq(reviewsTable.listingId, parsed.data.listingId));

  if (ratingResult) {
    await db.update(listingsTable).set({
      rating: String(ratingResult.avg),
      reviewCount: Number(ratingResult.count),
    }).where(eq(listingsTable.id, parsed.data.listingId));
  }

  const [reviewer] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({
    id: review.id,
    listingId: review.listingId,
    bookingId: review.bookingId ?? null,
    reviewerId: review.reviewerId,
    reviewerName: reviewer?.name ?? null,
    reviewerAvatar: reviewer?.avatar ?? null,
    rating: review.rating,
    comment: review.comment ?? null,
    createdAt: review.createdAt.toISOString(),
  });
});

router.get("/reviews/listing/:listingId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId;
  const params = GetListingReviewsParams.safeParse({ listingId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.listingId, params.data.listingId));
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(reviews.map(r => ({
    id: r.id,
    listingId: r.listingId,
    bookingId: r.bookingId ?? null,
    reviewerId: r.reviewerId,
    reviewerName: userMap.get(r.reviewerId)?.name ?? null,
    reviewerAvatar: userMap.get(r.reviewerId)?.avatar ?? null,
    rating: r.rating,
    comment: r.comment ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;
