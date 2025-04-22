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
    value: {
      anyOf: [
        { type: "number" },
        { type: "string" }
      ]
    }
  },
  required: ["smartpot_serial", "typeOfData", "value"],

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
    if (data.typeOfData === "water") {
      if (typeof data.value !== "string") {
        return sendClientError(reply, `value must be a string for typeOfData water`);
      }
    } else {
      if (typeof data.value !== "number") {
        return sendClientError(reply, `value must be a number for typeOfData ${data.typeOfData}`);
      }
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
