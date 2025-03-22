import { NextFunction, Request, Response } from "express";
import User, { IUser } from "./user.model";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};
