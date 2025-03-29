import { Schema, model, Document, Types } from "mongoose";

export interface ISchedule extends Document {
  flower_id: Types.ObjectId;
  active: boolean;
  monday: {
    from: Date;
    to: Date;
  };
  tuesday: {
    from: Date;
    to: Date;
  };
  wednesday: {
    from: Date;
    to: Date;
  };
  thursday: {
    from: Date;
    to: Date;
  };  
  friday: {
    from: Date;
    to: Date;
  };
  saturday: {
    from: Date;
    to: Date;
  };    
  sunday: {
    from: Date;
    to: Date;
  };  
}

const SCHEDULE_SCHEMA = new Schema<ISchedule>(
  {
    flower_id: { type: Schema.Types.ObjectId, ref: "Flower", required: true },
    active: { type: Boolean, required: true },
    monday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
    tuesday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
    wednesday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
    thursday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
    friday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
    saturday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
    sunday: {
      "from": { type: Date, required: false },
      "to": { type: Date, required: false },
    },
  },
  { timestamps: true }
); // Adds `createdAt` & `updatedAt` fields

const SCHEDULE_MODEL = model<ISchedule>("Schedule", SCHEDULE_SCHEMA);

export default SCHEDULE_MODEL;
