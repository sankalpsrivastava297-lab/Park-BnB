import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  GetMeResponse,
  UpdateMeBody,
  UpdateMeResponse,
  RegisterUserBody,
  RegisterUserResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getUserId(req: { headers: Record<string, string | string[] | undefined> }): number | null {
  const raw = req.headers["x-user-id"];
  if (!raw) return null;
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  return isNaN(id) ? null : id;
}

router.get("/users/me", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetMeResponse.parse({
    ...user,
    rating: user.rating ? parseFloat(user.rating) : null,
    createdAt: user.createdAt.toISOString(),
  }));
});

router.patch("/users/me", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, userId)).returning();
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(UpdateMeResponse.parse({
    ...updated,
    rating: updated.rating ? parseFloat(updated.rating) : null,
    createdAt: updated.createdAt.toISOString(),
  }));
});

router.post("/users/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, name, phone, role } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    const user = existing[0];
    res.json(RegisterUserResponse.parse({
      ...user,
      rating: user.rating ? parseFloat(user.rating) : null,
      createdAt: user.createdAt.toISOString(),
    }));
    return;
  }
  const [newUser] = await db.insert(usersTable).values({
    email,
    name,
    phone: phone ?? null,
    role: (role as "driver" | "host" | "both" | "admin") ?? "driver",
  }).returning();
  res.json(RegisterUserResponse.parse({
    ...newUser,
    rating: newUser.rating ? parseFloat(newUser.rating) : null,
    createdAt: newUser.createdAt.toISOString(),
  }));
});

export default router;
