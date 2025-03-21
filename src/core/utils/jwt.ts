import jwt from "jsonwebtoken";

import { IUser } from "../../features/users/user.model";

// Generate access token
export const generateAccessToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ _id: user._id, email: user.email }, secret, {
    expiresIn: "30m",
  });
};

// Generate refresh token
export const generateRefreshToken = (user: IUser): string => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return jwt.sign({ _id: user._id, email: user.email }, refreshSecret, {
    expiresIn: "7d",
  });
};

// Verify access token
export const verifyAccessToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }
    return jwt.verify(token, refreshSecret);
  } catch (error) {
    return null;
  }
};
