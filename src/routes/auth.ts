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

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);
const tokenService = new TokenService();

const authController = new AuthCotroller(userService, logger, tokenService);

router.post("/register", registerValidator, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.register(req, res, next);
}) as RequestHandler);

export default router;
