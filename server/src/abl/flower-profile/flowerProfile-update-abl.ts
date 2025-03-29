import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import flowerProfileUpdateDao from "../../dao/flower-profile/flowerProfile-update-dao";
import { IFlowerProfile } from "@/models/FlowerProfile";

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
    flower_id: { type: "string" },
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function flowerProfileUpdateAbl(
  data: IFlowerProfile,
  reply: FastifyReply
) {
  try {
    const valid = ajv.validate(schema, data);

    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    const updatedFlowerProfile = await flowerProfileUpdateDao(
      data.id as string,
      data
    );
    return sendSuccess(
      reply,
      updatedFlowerProfile,
      "Flower profile updated successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileUpdateAbl;
