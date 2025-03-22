import express from "express";
import { authenticateToken, checkIsAdmin } from "../auth/auth.middleware";
import { createItemCategory, getAllItemCategories } from "./item.controller";

const router = express.Router();

router.get("/category", getAllItemCategories);
router.post("/category", authenticateToken, checkIsAdmin, createItemCategory);

export default router;
