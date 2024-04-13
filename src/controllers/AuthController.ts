import { Request, Response } from "express";

export class AuthCotroller {
    register(req: Request, res: Response) {
        res.status(201).json();
    }
}
