import { Schema, model, Document, Types } from "mongoose";

export interface IMeasurement extends Document {
  flower_id: Types.ObjectId;
  humidity?: number;
  water_level?: string;
  temperature?: number;
  light?: number;
}

const measurementSchema = new Schema<IMeasurement>(
  {
    flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
    humidity: { type: Number, required: false },
    water_level: {
      type: String,
      required: false,
      enum: ["low", "medium", "high"],
    },
    temperature: { type: Number, required: false },
    light: { type: Number, required: false },
  },
  { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const MeasurementModel = model<IMeasurement>("Measurement", measurementSchema);

export default MeasurementModel;
