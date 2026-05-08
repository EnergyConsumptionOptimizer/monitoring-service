import express from "express";
import cookieParser from "cookie-parser";
import { apiRouter } from "./dependencies";
import { errorHandler } from "@presentation/web-api/middlewares/errorHandlerMiddleware";

const app = express();
app.use(express.json());
app.use(apiRouter);
app.use(cookieParser());
app.use(errorHandler);

export default app;
