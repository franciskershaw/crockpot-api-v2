import mongoose, { Model, ObjectId } from "mongoose";

interface IShoppingListItem {
  _id: ObjectId;
  item: ObjectId; // Reference to Item
  quantity: number;
  unit: ObjectId; // Reference to Unit
  obtained: boolean;
  source: "recipe" | "extra"; // Track where this item came from
  recipes?: {
    // If from recipes, track which ones contributed
    recipeId: ObjectId;
    quantity: number;
  }[];
}

interface IShoppingList {
  _id: ObjectId;
  user: ObjectId;
  items: IShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

const RecipeContributionSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ShoppingListItemSchema = new mongoose.Schema(
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
    obtained: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["recipe", "extra"],
      required: true,
    },
    recipes: [RecipeContributionSchema],
  },
  { _id: true }
);

const ShoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [ShoppingListItemSchema],
  },
  { timestamps: true }
);

// Index to efficiently find a user's active shopping list
ShoppingListSchema.index({ user: 1 });

const ShoppingList: Model<IShoppingList> = mongoose.model<IShoppingList>(
  "ShoppingList",
  ShoppingListSchema
);
export default ShoppingList;
