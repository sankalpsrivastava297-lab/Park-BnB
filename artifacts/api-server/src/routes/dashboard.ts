import { Router, type IRouter } from "express";
import { eq, and, sum, count, avg, sql } from "drizzle-orm";
import { db, bookingsTable, listingsTable } from "@workspace/db";
import { GetEarningsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [earningsResult] = await db.select({
    total: sum(bookingsTable.totalPrice),
  }).from(bookingsTable).where(and(
    eq(bookingsTable.hostId, userId),
    sql`status NOT IN ('cancelled')`
  ));

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const [monthEarnings] = await db.select({
    total: sum(bookingsTable.totalPrice),
  }).from(bookingsTable).where(and(
    eq(bookingsTable.hostId, userId),
    sql`status NOT IN ('cancelled')`,
    sql`created_at >= ${thisMonth.toISOString()}`
  ));

  const [bookingStats] = await db.select({
    total: count(),
    active: sql<number>`sum(case when status = 'active' then 1 else 0 end)`,
    pending: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
  }).from(bookingsTable).where(eq(bookingsTable.hostId, userId));

  const [listingStats] = await db.select({
    total: count(),
    active: sql<number>`sum(case when status = 'active' then 1 else 0 end)`,
    avgRating: avg(listingsTable.rating),
  }).from(listingsTable).where(eq(listingsTable.hostId, userId));

  res.json({
    totalEarnings: parseFloat(earningsResult?.total ?? "0"),
    thisMonthEarnings: parseFloat(monthEarnings?.total ?? "0"),
    totalBookings: Number(bookingStats?.total ?? 0),
    activeBookings: Number(bookingStats?.active ?? 0),
    pendingBookings: Number(bookingStats?.pending ?? 0),
    totalListings: Number(listingStats?.total ?? 0),
    activeListings: Number(listingStats?.active ?? 0),
    averageRating: parseFloat(listingStats?.avgRating ?? "0") || 0,
    occupancyRate: 75,
  });
});

router.get("/dashboard/earnings", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetEarningsQueryParams.safeParse(req.query);
  const period = params.success ? (params.data.period ?? "month") : "month";

  let groupFormat: string;
  let periods: string[];

  if (period === "week") {
    groupFormat = "YYYY-MM-DD";
    periods = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
  } else if (period === "year") {
    groupFormat = "YYYY-MM";
    periods = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
  } else {
    groupFormat = "YYYY-MM-DD";
    periods = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
  }

  const earningsData = await db.select({
    period: sql<string>`to_char(created_at, ${groupFormat})`,
    amount: sum(bookingsTable.totalPrice),
    bookings: count(),
  }).from(bookingsTable)
    .where(and(
      eq(bookingsTable.hostId, userId),
      sql`status NOT IN ('cancelled')`
    ))
    .groupBy(sql`to_char(created_at, ${groupFormat})`)
    .orderBy(sql`to_char(created_at, ${groupFormat})`);

  const earningsMap = new Map(earningsData.map(e => [e.period, e]));
  const totalAmount = earningsData.reduce((sum, e) => sum + parseFloat(e.amount ?? "0"), 0);

  const breakdown = periods.map(p => ({
    period: p,
    amount: parseFloat(earningsMap.get(p)?.amount ?? "0"),
    bookings: Number(earningsMap.get(p)?.bookings ?? 0),
  }));

  res.json({
    total: totalAmount,
    breakdown,
  });
});

export default router;
