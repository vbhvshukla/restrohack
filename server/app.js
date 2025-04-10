import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRoutes, teamRoutes, departmentRoutes, positionRoutes, questionnaireRoutes } from "./routes/imports.routes.js";

const app = express();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

//CORS configuration
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

//URL Encoded Configuration
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);
app.use(express.json());
app.use(cookieParser());

app.use(`${API_PREFIX}/department`, departmentRoutes);
app.use(`${API_PREFIX}/position`, positionRoutes);
app.use(`${API_PREFIX}/team`, teamRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/questionnaire`, questionnaireRoutes);
export { app }