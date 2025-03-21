import { NextFunction, Request, Response } from "express";
import User, { IUser } from "./user.model";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as IUser;

    const user = await User.findById(_id);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
