import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

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



export { app }