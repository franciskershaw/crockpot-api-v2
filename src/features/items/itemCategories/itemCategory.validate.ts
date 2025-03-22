import Joi from "joi";

export const createItemCategorySchema = Joi.object({
  name: Joi.string().required(),
  faIcon: Joi.string().required(),
});
