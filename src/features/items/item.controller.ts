import { Request, Response, NextFunction } from "express";
import validateRequest from "../../core/utils/validate";
import { createItemCategorySchema } from "./itemCategories/itemCategory.validate";
import ItemCategory from "./itemCategories/itemCategory.model";

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
  } catch (error) {
    next(error);
  }
};
