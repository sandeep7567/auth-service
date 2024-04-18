import express, { NextFunction, RequestHandler, Response } from "express";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/tenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { CreateTenantRequest } from "../types";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]) as RequestHandler,
    (async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        await tenantController.create(req, res, next);
    }) as RequestHandler,
);

router.patch(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]) as RequestHandler,
    (async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        await tenantController.update(req, res, next);
    }) as RequestHandler,
);

router.get("/", (async (
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction,
) => {
    await tenantController.getAll(req, res, next);
}) as RequestHandler);

router.get("/:id", (async (
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction,
) => {
    await tenantController.getOne(req, res, next);
}) as RequestHandler);

export default router;
