import mongoose, { CallbackError, Document, Model, ObjectId } from "mongoose";
import User from "../users/user.model";

const ingredientSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

interface IRecipe extends Document {
  name: string;
  timeInMinutes: number;
  image: {
    url: string;
    filename: string;
  };
  ingredients: {
    item: ObjectId;
    quantity: number;
    unit: ObjectId;
  }[];
  instructions: string[];
  notes: string[];
  categories: ObjectId[];
  createdBy: ObjectId;
  approved: boolean;
  serves: number;
}

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timeInMinutes: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  ingredients: [ingredientSchema],
  instructions: [
    {
      type: String,
      required: true,
    },
  ],
  notes: [
    {
      type: String,
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeCategory",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
  serves: {
    type: Number,
    required: true,
  },
});

RecipeSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const recipeId = this._id;
      // remove recipe id from user's 'favouriteRecipes'
      await User.updateMany(
        { favouriteRecipes: recipeId },
        { $pull: { favouriteRecipes: recipeId } }
      );

      // remove recipe id from user's 'recipeMenu'
      await User.updateMany(
        { "recipeMenu._id": recipeId },
        { $pull: { recipeMenu: { _id: recipeId } } }
      );

      next();
    } catch (error) {
      next(error as CallbackError);
    }
  }
);

const Recipe: Model<IRecipe> = mongoose.model<IRecipe>("Recipe", RecipeSchema);
export default Recipe;
