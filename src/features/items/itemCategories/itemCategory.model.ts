import mongoose, { Document, Model } from "mongoose";

interface IItemCategory extends Document {
  name: string;
  faIcon: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemCategorySchema = new mongoose.Schema<IItemCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    faIcon: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const ItemCategory: Model<IItemCategory> = mongoose.model<IItemCategory>(
  "ItemCategory",
  ItemCategorySchema
);

export default ItemCategory;
