import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { TokenService } from "../services/tokenService";
import { UserService } from "../services/userService";
import { AuthRequest, RegisterUserRequest } from "../types";
import createHttpError from "http-errors";
import { CredentialService } from "../services/credentialService";
import { Roles } from "../constants";

export class AuthCotroller {
    // userService: UserService;

    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}
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

        this.logger.debug("New request to login user", {
            email,
            firstName,
            lastName,
            password: "******",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token;
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1hr
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info("User has been register!", {
                id: user.id,
            });

            res.status(201).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        this.logger.debug("New request to login user", {
            email,
            password: "******",
        });

        try {
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(error);
                return;
            }

            // password match
            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user?.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "Email or password does not match",
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token;
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1hr
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info("User has been login", { id: user.id });

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        res.json({ ...user, password: undefined });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const error = createHttpError(
                    400,
                    "User with the token could not find",
                );
                next(error);
                return;
            }

            // Persist the refresh token;
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1hr
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info("User has been login", { id: user.id });

            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("User has been logged out", { id: req.auth.sub });

            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            res.status(200).json({});
        } catch (err) {
            next(err);
            return;
        }
    }
}
