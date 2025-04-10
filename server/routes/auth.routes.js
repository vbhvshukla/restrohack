import { getCurrentUser, loginUser, logout } from "../controller/auth.controller.js";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);

router.get("/logout", logout);

router.get("/currentUser", getCurrentUser);

export default router;