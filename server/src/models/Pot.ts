import { Schema, model, Document } from "mongoose";

export interface IPot extends Document {
  id_profile: string;
  name: string;
}

const POT_SCHEMA = new Schema<IPot>(
  {
    id_profile: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const POT_MODEL = model<IPot>("Pot", POT_SCHEMA);

export default POT_MODEL;
