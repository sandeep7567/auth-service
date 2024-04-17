import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { AuthCotroller } from "../controllers/AuthController";
import { UserService } from "./../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import registerValidator from "../validators/register-validator";
import logger from "../config/logger";
import { TokenService } from "../services/tokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/credentialService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const refreshRepository = AppDataSource.getRepository(RefreshToken);

const userService = new UserService(userRepository);

const tokenService = new TokenService(refreshRepository);
const credentialService = new CredentialService();

const authController = new AuthCotroller(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post("/register", registerValidator, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.register(req, res, next);
}) as RequestHandler);

router.post("/login", loginValidator, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.login(req, res, next);
}) as RequestHandler);

router.get(
    "/self",
    authenticate as RequestHandler,
    (req: Request, res: Response) =>
        authController.self(
            req as AuthRequest,
            res,
        ) as unknown as RequestHandler,
);

export default router;
