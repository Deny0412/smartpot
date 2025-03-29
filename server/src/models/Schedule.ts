import { Schema, model, Document, Types } from "mongoose";

interface TimeSlot {
    from: string | null;
    to: string | null;
}

export interface ISchedule extends Document {
    flower_id: Types.ObjectId;
    active: boolean;
    monday: TimeSlot;
    tuesday: TimeSlot;
    wednesday: TimeSlot;
    thursday: TimeSlot;
    friday: TimeSlot;
    saturday: TimeSlot;
    sunday: TimeSlot;
}

const timeSlotSchema = new Schema({
    from: { type: String, required: false, default: null },
    to: { type: String, required: false, default: null }
});

const SCHEDULE_SCHEMA = new Schema<ISchedule>(
    {
        flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
        active: { type: Boolean, required: true, default: false },
        monday: { type: timeSlotSchema, required: true, default: () => ({}) },
        tuesday: { type: timeSlotSchema, required: true, default: () => ({}) },
        wednesday: { type: timeSlotSchema, required: true, default: () => ({}) },
        thursday: { type: timeSlotSchema, required: true, default: () => ({}) },
        friday: { type: timeSlotSchema, required: true, default: () => ({}) },
        saturday: { type: timeSlotSchema, required: true, default: () => ({}) },
        sunday: { type: timeSlotSchema, required: true, default: () => ({}) }
    },
    { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const SCHEDULE_MODEL = model<ISchedule>("Schedule", SCHEDULE_SCHEMA);

export default SCHEDULE_MODEL;
