import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../core/utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../../core/errors/errors";
import { IUser } from "../users/user.model";
import { REFRESH_TOKEN_COOKIE_OPTIONS } from "../../core/utils/constants";

export const authenticateToken = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new UnauthorizedError("No token provided", "TOKEN_MISSING"));
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return next(
      new UnauthorizedError(
        "Invalid or expired access token",
        "INVALID_ACCESS_TOKEN"
      )
    );
  }

  req.user = decoded;

  next();
};

export const refreshTokens = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(
      new UnauthorizedError(
        "No refresh token provided",
        "REFRESH_TOKEN_MISSING"
      )
    );
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    res.clearCookie("refreshToken");
    return next(new ForbiddenError("Invalid or expired refresh token"));
  }

  const newAccessToken = generateAccessToken(decoded as IUser);
  const newRefreshToken = generateRefreshToken(decoded as IUser);

  res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(200).json({ accessToken: newAccessToken });
};
