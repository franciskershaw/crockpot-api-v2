import mongoose, { Model, ObjectId } from "mongoose";

interface IItem {
  _id: ObjectId;
  name: string;
  category: ObjectId;
  validUnits: ObjectId[]; // References to valid Unit documents
  defaultUnit: ObjectId; // Default unit for this item
  density?: number; // For items that can be measured by both volume and weight
  // e.g., 1 ml of oil = 0.92g, useful for unit conversions
}

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  validUnits: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Unit",
    required: true,
  },
  defaultUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: true,
  },
  density: {
    type: Number,
    required: false,
  },
});

const Item: Model<IItem> = mongoose.model<IItem>("Item", ItemSchema);
export default Item;
