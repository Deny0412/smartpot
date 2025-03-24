import { Schema, model, Document } from "mongoose";

interface IHousehold extends Document {
  name: string;
  owner: string;
  members: [string];
  invites: [string];
}

const HOUSEHOLD_SCHEMA = new Schema<IHousehold>(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    members: { type: [String], required: true },
    invites: { type: [String], required: true },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const HOUSEHOLD_MODEL = model<IHousehold>("Household", HOUSEHOLD_SCHEMA);

export default HOUSEHOLD_MODEL;
