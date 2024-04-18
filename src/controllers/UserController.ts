import { Roles } from "./../constants";
import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";
export class UserController {
    constructor(private userService: UserService) {}

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
}
