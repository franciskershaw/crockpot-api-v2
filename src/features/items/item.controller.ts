import { Request, Response, NextFunction } from "express";
import validateRequest from "../../core/utils/validate";
import { createItemCategorySchema } from "./itemCategories/itemCategory.validate";
import ItemCategory from "./itemCategories/itemCategory.model";

export const getAllItemCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemCategories = await ItemCategory.find();
    res.status(200).json(itemCategories);
  } catch (err) {
    next(err);
  }
};

export const createItemCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, createItemCategorySchema);

    const { name, faIcon } = value;

    const itemCategory = new ItemCategory({ name, faIcon });

    await itemCategory.save();

    res.status(201).json(itemCategory);
  } catch (err) {
    next(err);
  }
};
