import mongoose, { Document, Model } from "mongoose";

interface IRecipeCategory extends Document {
  name: string;
}

const RecipeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const RecipeCategory: Model<IRecipeCategory> = mongoose.model<IRecipeCategory>(
  "RecipeCategory",
  RecipeCategorySchema
);

export default RecipeCategory;
