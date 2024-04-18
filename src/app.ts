import "reflect-metadata";

import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";

const app = express();

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);

app.use(globalErrorHandler);

export default app;
