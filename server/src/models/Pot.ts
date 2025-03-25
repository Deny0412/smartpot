import { Schema, model, Document } from "mongoose";

export interface IPot extends Document {
  id_profile: string;
  name: string;
  id_household: string;
}

const potSchema = new Schema<IPot>(
  {
    id_profile: { type: String, required: true },
    name: { type: String, required: true },
    id_household: { type: String, required: true },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const PotModel = model<IPot>("Pot", potSchema);

export default PotModel;
