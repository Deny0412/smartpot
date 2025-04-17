import { FastifyRequest, FastifyReply } from "fastify";
import createMeasurement from "../../dao/measurement/measurement-create-dao";
import getSmartpot from "../../dao/smartpot/smart-pot-get-dao";

import { IMeasurement } from "../../models/Measurement";
import { Types } from "mongoose";

import {
  sendClientError,
  sendCreated,
  sendError,
} from "../../middleware/response-handler";
import Ajv from "ajv";

const schema = {
  type: "object",
  properties: {
    smartpot_id: { type: "string" },
    humidity: { type: "number" },
    water_level: { type: "string" },
    temperature: { type: "number" },
    light: { type: "number" },
  },
  required: ["smartpot_id"],
  additionalProperties: false,
  anyOf: [
    { required: ["humidity"] },
    { required: ["water_level"] },
    { required: ["temperature"] },
    { required: ["light"] },
  ],
};

const ajv = new Ajv();

async function createMeasurementHandler(
  data: IMeasurement,
  reply: FastifyReply
) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const smartpot = await getSmartpot(data.smartpot_id as string);
    const flower = smartpot?.active_flower_id;
    if (!flower) {
      sendClientError(reply, "Flower does not exist");
    }
    data.flower_id = new Types.ObjectId(String(flower));
    const createdMeasurement = await createMeasurement(data);

    sendCreated(reply, createdMeasurement, "Measurement created successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default createMeasurementHandler;
