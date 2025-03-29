import { Schema, model, Document, Types } from "mongoose";

export interface IMeasurement extends Document {
  flower_id: Types.ObjectId;
  humidity: number;
  waterlevel: number;
  temperature: number;
  light: number;
}

const measurementSchema = new Schema<IMeasurement>(
  {
    flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
    humidity: { type: Number, required: true },
    waterlevel: { type: Number, required: true },
    temperature: { type: Number, required: true },
    light: { type: Number, required: true },
  },
  { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const MeasurementModel = model<IMeasurement>("Measurement", measurementSchema);

export default MeasurementModel;
