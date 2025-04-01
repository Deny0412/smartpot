import { Schema, model, Document, Types } from "mongoose";

export interface IFlower extends Document {
  profile_id: string;
  name: string;
  household_id: Types.ObjectId;
  serial_number: string;
}

const flowerSchema = new Schema<IFlower>(
  {
    profile_id: { type: String, required: false, default: null },
    name: { type: String, required: true },
    household_id: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    serial_number: { type: String, required: false, default: null },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const FlowerModel = model<IFlower>("Flower", flowerSchema);

export default FlowerModel;
