import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { UserService } from "../services/userService";
import { RegisterUserRequest } from "../types";
export class AuthCotroller {
    userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

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
