import { Schema, model, Document } from "mongoose";

export interface IMeasurement extends Document {
  pot_id: string;
  type: "humidity" | "temperature" | "waterlevel";
  value: number;
  unit: string;
  timestamp: Date;
}

const measurementSchema = new Schema<IMeasurement>(
  {
    pot_id: { type: String, required: true },
    type: { type: String, enum: ["humidity", "temperature", "waterlevel"], required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true }, // %, °C, cm, atd.
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const MeasurementModel = model<IMeasurement>("Measurement", measurementSchema);

export default MeasurementModel;
