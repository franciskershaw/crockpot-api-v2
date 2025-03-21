// Passport
export const GOOGLE_PROVIDER = "google";
export const LOCAL_PROVIDER = "local";

// Cookie
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  sameSite: "strict" as const,
} as const;
