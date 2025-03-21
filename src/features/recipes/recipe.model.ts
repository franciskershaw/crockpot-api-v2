import mongoose, { CallbackError, Document, Model, ObjectId } from "mongoose";
import User from "../users/user.model";

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
  ingredients: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true,
      },
    },
  ],
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

const Recipe: Model<IRecipe> = mongoose.model<IRecipe>("Recipe", RecipeSchema);
export default Recipe;
