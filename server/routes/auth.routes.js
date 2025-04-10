import { loginUser, logout } from "../controller/auth.controller.js";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);

router.get("/logout", logout);

export default router;