import express from "express";
import { authenticateToken, checkIsAdmin } from "../auth/auth.middleware";
import { createItemCategory } from "./item.controller";

const router = express.Router();

router.post("/category", authenticateToken, checkIsAdmin, createItemCategory);

export default router;
