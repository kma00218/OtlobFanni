import { Router, type IRouter } from "express";
import healthRouter from "./health";
import publicRouter from "./public";
import adminRouter from "./admin";
import storageRouter from "./storage";
import analyticsRouter from "./analytics";
import suppliersRouter from "./suppliers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(analyticsRouter);
router.use(suppliersRouter);
router.use(publicRouter);
router.use("/admin", adminRouter);

export default router;
