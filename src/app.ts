import express from "express";
import { apiRouter } from "@interfaces/dependencies";
import cookieParser from "cookie-parser";
import { errorHandler } from "@interfaces/web-api/middlewares/errorHandlerMiddleware";

const app = express();
app.use(apiRouter);
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

export default app;
