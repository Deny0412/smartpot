import { IMeasurement } from "@/models/Measurement";
import {
  sendClientError,
  sendError,
  sendSuccess,
} from "../../middleware/response-handler";
import { FastifyReply } from "fastify";
import getFlower from "../../dao/flower/flower-get-dao";
import addMeasurement from "../../dao/flower/flower-measurement-add";
import Ajv from "ajv";

const schema = {
  type: "object",
  properties: {
    flower_id: { type: "string" },
    temperature: { type: "number" },
    humidity: { type: "number" },
    light: { type: "number" },
    water_level: { type: "number" },
  },
  required: ["flower_id"],
  additionalProperties: false,
};
const ajv = new Ajv();

async function flowerAddMeasurementHandler(
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
    const flowerExists = await getFlower(data.flower_id.toString());
    console.log("flowerExists", flowerExists);
    if (!flowerExists) {
      return sendClientError(reply, "Flower ID does not exist");
    }
    const flower = await addMeasurement(data);
    return sendSuccess(reply, flower, "Measurement added successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default flowerAddMeasurementHandler;
