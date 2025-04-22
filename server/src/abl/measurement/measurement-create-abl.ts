import { FastifyRequest, FastifyReply } from "fastify";
import createMeasurement from "../../dao/measurement/measurement-create-dao";
import getSmartpot from "../../dao/smartpot/smart-pot-get-by-serial-number";
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
    smartpot_serial: { type: "string" },
    typeOfData: {
      type: "string",
      enum: ["humidity", "water", "temperature", "light"]
    },
    humidity: { type: "number" },
    water_level: { type: "string" },
    temperature: { type: "number" },
    light: { type: "number" },
  },
  required: ["smartpot_serial", "typeOfData"],
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
  data: Object,
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
    const typeFieldMap: Record<string, string> = {
      humidity: "humidity",
      water: "water_level",
      temperature: "temperature",
      light: "light",
    };

    const expectedField = typeFieldMap[data.typeOfData as string];

    if (!expectedField || !(expectedField in data)) {
      sendClientError(
        reply,
        `Field "${expectedField}" must be provided for typeOfData "${data.typeOfData}"`
      );
      return;
    }

    const smartpot = await getSmartpot(data.smartpot_serial as string);

    if (!smartpot) {
      sendClientError(reply, "Smart pot does not exist");
    }

    const flower = smartpot?.active_flower_id;

    if (!flower) {
      sendClientError(reply, "Smart pot does not have active flower");
    }
    data.flower_id = new Types.ObjectId(String(flower));

    const createdMeasurement = await createMeasurement(data);

    sendCreated(reply, createdMeasurement, "Measurement created successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default createMeasurementHandler;
