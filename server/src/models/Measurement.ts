import { Schema, model, Document, Types } from "mongoose";

export interface IMeasurement extends Document {
  flower_id: Types.ObjectId;
  humidity: number;
  water_level: number;
  temperature: number;
  light: number;
}

const measurementSchema = new Schema<IMeasurement>(
  {
    flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
    humidity: { type: Number, required: false,default:null },
    water_level: { type: Number, required: false,default:null },
    temperature: { type: Number, required: false,default:null },
    light: { type: Number, required: false,default:null },
  },
  { timestamps: true }
); // createdAt = zápis do DB, timestamp = čas měření

const MeasurementModel = model<IMeasurement>("Measurement", measurementSchema);

export default MeasurementModel;
