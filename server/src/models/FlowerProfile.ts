import { Schema, model, Document } from "mongoose";

interface IRange {
  min: number;
  max: number;
}

export interface IFLowerProfile extends Document {
  temperature: IRange;
  humidity: IRange;
  idHouseHold: string;
}

const RANGE_SCHEMA = new Schema<IRange>({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
});

const FLOWER_PROFILE_SCHEMA = new Schema<IFLowerProfile>(
  {
    temperature: { type: RANGE_SCHEMA, required: true },
    humidity: { type: RANGE_SCHEMA, required: true },
    idHouseHold: { type: String, required: true },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

const FLOWER_PROFILE_MODEL = model<IFLowerProfile>(
  "FlowerProfile",
  FLOWER_PROFILE_SCHEMA
);

export default FLOWER_PROFILE_MODEL;
