import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import createUserValidator from "../validators/create-user-validator";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]) as RequestHandler,
    createUserValidator,
    (async (req: Request, res: Response, next: NextFunction) => {
        await userController.create(req, res, next);
    }) as RequestHandler,
);

export default router;
