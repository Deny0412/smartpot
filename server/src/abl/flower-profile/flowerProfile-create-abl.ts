import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import flowerProfileCreateDao from "../../dao/flower-profile/flowerProfile-create-dao";
import { IFlowerProfile } from "../../models/FlowerProfile";
import { sendError, sendSuccess } from "../../middleware/response-handler";

const schema = {
  type: "object",
  properties: {
    temperature: {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
      },
      required: ["min", "max"],
      additionalProperties: false,
    },
    humidity: {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
      },
      required: ["min", "max"],
      additionalProperties: false,
    },
  },
  required: ["temperature", "humidity"],
  additionalProperties: false,
};

async function flowerProfileCreateAbl(
  data: IFlowerProfile,
  reply: FastifyReply
) {
  try {
    const valid = ajv.validate(schema, data);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    const newFlowerProfile = await flowerProfileCreateDao(data);
    sendSuccess(
      reply,
      newFlowerProfile,
      "Flower profile assigned successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}

export default flowerProfileCreateAbl;
