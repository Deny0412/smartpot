import { Schema, model, Document } from "mongoose";

interface IRange {
  min: number;
  max: number;
}

export interface IFlowerProfile extends Document {
  temperature: IRange;
  humidity: IRange;
  flower_id: string;
}

const RANGE_SCHEMA = new Schema<IRange>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  { _id: false } // This disables the creation of _id for each subdocument
);

const FLOWER_PROFILE_SCHEMA = new Schema<IFlowerProfile>(
  {
    temperature: { type: RANGE_SCHEMA, required: true },
    humidity: { type: RANGE_SCHEMA, required: true },
    flower_id: { type: String, required: true },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

const FLOWER_PROFILE_MODEL = model<IFlowerProfile>(
  "FlowerProfile",
  FLOWER_PROFILE_SCHEMA
);

export default FLOWER_PROFILE_MODEL;
