import { Document, Schema, Types, model } from 'mongoose'

export interface ILightMeasurement extends Document {
  flower_id: Types.ObjectId
  value: number
  createdAt: Date
  updatedAt: Date
}

const LIGHT_SCHEMA = new Schema<ILightMeasurement>(
  {
    flower_id: { type: Schema.Types.ObjectId, ref: 'Flower', required: true },
    value: { type: Number, required: true },
  },
  { timestamps: true }
) // createdAt = zápis do DB, timestamp = čas měření

const LIGHT_MODEL = model<ILightMeasurement>('LightMeasurement', LIGHT_SCHEMA)

export default LIGHT_MODEL
