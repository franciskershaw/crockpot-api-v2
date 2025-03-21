import mongoose, { Document, Model } from "mongoose";

// Define the interface for the document
interface IItemCategory extends Document {
  name: string;
  faIcon: string;
}

const ItemCategorySchema = new mongoose.Schema<IItemCategory>({
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
});

const ItemCategory: Model<IItemCategory> = mongoose.model<IItemCategory>(
  "ItemCategory",
  ItemCategorySchema
);

export default ItemCategory;
