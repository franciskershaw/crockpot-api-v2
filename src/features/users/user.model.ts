import mongoose, { Document, Model, ObjectId } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: "user" | "admin";
  provider: "google" | "local";
  googleId?: string;
  favouriteRecipes: ObjectId[];
  recipeMenu: {
    recipe: ObjectId;
    serves: number;
  }[];
  regularItems: {
    item: ObjectId;
    quantity: number;
    unit: ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    provider: {
      type: String,
      enum: ["google", "local"],
      required: true,
    },
    googleId: {
      type: String,
      required: false,
    },
    favouriteRecipes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Recipe",
        },
      ],
      default: [],
    },
    recipeMenu: {
      type: [
        {
          recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe",
            required: true,
          },
          serves: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    regularItems: {
      type: [
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
      default: [],
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
