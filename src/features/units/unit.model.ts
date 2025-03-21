import mongoose, { ObjectId, Document, Model } from "mongoose";

interface IUnit extends Document {
  _id: ObjectId;
  name: string;
  abbreviation: string;
  type: "weight" | "volume" | "count" | "custom";
  conversions?: {
    // Optional conversion factors to standard units
    toStandard: number; // e.g., 1 tbsp = 15 ml, so toStandard = 15
    standardUnit: ObjectId; // Reference to the standard unit (ml for volume, g for weight)
  };
}

const UnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  abbreviation: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["weight", "volume", "count", "custom"],
    required: true,
  },
  conversions: {
    type: {
      toStandard: { type: Number, required: true },
      standardUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: true,
      },
    },
    required: false,
  },
});

// Validate that standard units reference appropriate types
UnitSchema.pre("save", async function (next) {
  if (this.conversions && this.conversions.standardUnit) {
    const standardUnit = await mongoose
      .model("Unit")
      .findById(this.conversions.standardUnit);

    // Ensure the standard unit exists
    if (!standardUnit) {
      return next(new Error("Referenced standard unit does not exist"));
    }

    // Ensure the standard unit is of the same type
    if (standardUnit.type !== this.type) {
      return next(new Error("Standard unit must be of the same type"));
    }

    // Prevent circular references
    if (
      standardUnit.conversions &&
      standardUnit.conversions.standardUnit &&
      standardUnit.conversions.standardUnit.equals(this._id)
    ) {
      return next(new Error("Circular reference in standard unit"));
    }
  }
  next();
});

const Unit: Model<IUnit> = mongoose.model<IUnit>("Unit", UnitSchema);
export default Unit;
