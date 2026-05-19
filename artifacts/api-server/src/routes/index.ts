import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import listingsRouter from "./listings";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import searchRouter from "./search";
import dashboardRouter from "./dashboard";
import favoritesRouter from "./favorites";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(listingsRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(searchRouter);
router.use(dashboardRouter);
router.use(favoritesRouter);

export default router;
