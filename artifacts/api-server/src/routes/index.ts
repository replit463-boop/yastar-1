import { Router, type IRouter } from "express";
import healthRouter from "./health";
import calculateRouter from "./calculate";
import accountRouter from "./account";
import scenariosRouter from "./scenarios";
import adminRouter from "./admin";
import authRouter from "./auth";
import costItemsRouter from "./costItems";
import aiAdvisorRouter from "./aiAdvisor";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(calculateRouter);
router.use(accountRouter);
router.use(scenariosRouter);
router.use(adminRouter);
router.use(costItemsRouter);
router.use(aiAdvisorRouter);

export default router;
