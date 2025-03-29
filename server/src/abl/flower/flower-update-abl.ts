import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import { IFlower } from "../../models/Flower";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
import updateFlower from "../../dao/flower/flower-update-dao";
const SCHEMA = {
  type: "object",
  properties: {
    _id: { type: "string" },
    id_profile: { type: "string" },
    name: { type: "string" },
  },
  required: ["_id", "id_profile", "name"],
  additionalProperties: false,
};

async function updateFlowerHandler(data: IFlower, reply: FastifyReply) {
  try {
    const valid = MongoValidator.validateId(data.id);
    if (!valid) {
      return sendClientError(reply, "Invalid flower ID format");
    }

    const updatedFlower = await updateFlower(String(data.id), data);

    if (!updatedFlower) {
      return sendNotFound(reply, "Flower not found");
    }

    return sendSuccess(reply, updatedFlower, "Flower updated successfully");
  } catch (error) {
    console.error("Error updating flower:", error);
    return sendError(reply, "Failed to update flower");
  }
}

export default updateFlowerHandler;
