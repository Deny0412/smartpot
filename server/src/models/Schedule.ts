import { Schema, model, Document } from "mongoose";

export interface ISchedule extends Document {
  id_pot: string;
  monday: "";
  tuesday: "";
  wednesday: "";
  thursday: "";
  friday: "";
  saturday: "";
  sunday: "";
}

const SCHEDULE_SCHEMA = new Schema<ISchedule>(
  {
    id_pot: { type: String, required: true },
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {},
    sunday: {},
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const SCHEDULE_MODEL = model<ISchedule>("Schedule", SCHEDULE_SCHEMA);

export default SCHEDULE_MODEL;
