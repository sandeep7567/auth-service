import { Roles } from "./../constants";
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                email,
                firstName,
                lastName,
                password,
                role: Roles.MANAGER,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { id: userId } = req.params;
        const { firstName, lastName, role } = req.body;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }

        this.logger.debug("Request for updating a user", req.body);

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });

            this.logger.info("User has been updated", { id: userId });

            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();

            this.logger.info("All users have been fetched");
            res.json(users);
        } catch (err) {
            next(err);
        }
    }
}
