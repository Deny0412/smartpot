import { Schema, model, Document } from "mongoose";

export interface IFlower extends Document {
  profile_id: string;
  name: string;
  household_id: string;
  serial_number: string;
}

const flowerSchema = new Schema<IFlower>(
  {
    profile_id: { type: String, required: true },
    name: { type: String, required: true },
    household_id: { type: String, required: true },
    serial_number:{type:String, required:true}
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const FlowerModel = model<IFlower>("Flower", flowerSchema);

export default FlowerModel;
