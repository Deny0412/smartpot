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
import flowerProfileGetDao from "../../dao/flower-profile/flowerProfile-get-dao";
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
    const id_profile_validated = MongoValidator.validateId(data.profile_id.toString());
    if (!id_profile_validated) {
      return sendClientError(reply, "Invalid profile ID format");
    }

    const doesFlowerProfileExist = await flowerProfileGetDao(
      data.profile_id.toString()
    );
    if(!doesFlowerProfileExist){
        sendClientError(reply, "Flower profile does not exist");
        return;
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
