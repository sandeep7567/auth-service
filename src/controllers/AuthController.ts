import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/userService";
export class AuthCotroller {
    userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { firstName, lastName, email, password } = req.body;

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
