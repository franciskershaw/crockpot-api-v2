import express from "express";
import asyncHandler from "express-async-handler";
import { authenticateToken } from "../auth/auth.middleware";
import { getUserInfo } from "./user.controller";

const router = express.Router();

router.get("/", authenticateToken, asyncHandler(getUserInfo));

export default router;
