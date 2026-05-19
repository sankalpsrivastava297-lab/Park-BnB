import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import listingsRouter from "./listings";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import searchRouter from "./search";
import dashboardRouter from "./dashboard";
import favoritesRouter from "./favorites";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(listingsRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(searchRouter);
router.use(dashboardRouter);
router.use(favoritesRouter);
router.use(paymentsRouter);

export default router;
