import "reflect-metadata";

import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import authRouter from "./routes/auth";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use("/auth", authRouter);

app.use(globalErrorHandler);

export default app;
