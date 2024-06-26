import "reflect-metadata";

import express, { Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import { Config } from "./config";

const app = express();

app.use(
    cors({
        origin: [Config.ORIGIN_URI!],
        credentials: true,
    }),
);
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

app.use(globalErrorHandler);

export default app;
