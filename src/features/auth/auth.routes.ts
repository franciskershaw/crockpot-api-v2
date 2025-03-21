import express from "express";
import passport from "passport";
import { login, googleCallback, logout, register } from "./auth.controller";
import { refreshTokens } from "./auth.middleware";
import { GOOGLE_PROVIDER } from "../../core/utils/constants";

const router = express.Router();

// Local login route
router.post("/login", login);
router.post("/register", register);

// Google OAuth route
router.get(
  "/google",
  passport.authenticate(GOOGLE_PROVIDER, { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate(GOOGLE_PROVIDER, {
    session: false,
    failureRedirect: process.env.CORS_ORIGIN,
  }),
  googleCallback
);

// Logout route
router.post("/logout", logout);

// Refresh token route
router.get("/refresh-token", refreshTokens);

export default router;
