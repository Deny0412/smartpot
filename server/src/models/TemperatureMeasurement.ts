import { Document, Schema, Types, model } from 'mongoose'

export interface ITemperatureMeasurement extends Document {
  flower_id: Types.ObjectId
  value: number
  createdAt: Date
  updatedAt: Date
}

const TEMPERATURE_SCHEMA = new Schema<ITemperatureMeasurement>(
  {
    flower_id: { type: Schema.Types.ObjectId, ref: 'Flower', required: true },
    value: { type: Number, required: true },
  },
  { timestamps: true }
) // createdAt = zápis do DB, timestamp = čas měření

const TEMPERATURE_MODEL = model<ITemperatureMeasurement>('TemperatureMeasurement', TEMPERATURE_SCHEMA)

export default TEMPERATURE_MODEL
