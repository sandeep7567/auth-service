import express, { Request, RequestHandler, Response } from "express";
import { AuthCotroller } from "../controllers/AuthController";
import { UserService } from "./../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const authController = new AuthCotroller(userService);

router.post("/register", (async (req: Request, res: Response) => {
    await authController.register(req, res);
}) as RequestHandler);

export default router;
