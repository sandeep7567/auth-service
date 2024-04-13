import express from "express";
import { AuthCotroller } from "../controllers/AuthController";

const router = express.Router();

const authController = new AuthCotroller();

router.post("/register", (req, res) => authController.register(req, res));

export default router;
