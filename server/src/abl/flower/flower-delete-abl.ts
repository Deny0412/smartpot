import { FastifyRequest, FastifyReply } from "fastify";

import {
  sendClientError,
  sendError,
  sendNoContent,
  sendNotFound,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
import deleteFlower from "../../dao/flower/flower-delete-dao";

async function deleteFlowerHandler(id: string, reply: FastifyReply) {
  try {
    
    if (!MongoValidator.validateId(id)) {
      return sendClientError(reply, "Invalid flower ID format");
    }

    const deletedFlower = await deleteFlower(id);
    if (!deletedFlower) {
      return sendNotFound(reply, "Flower not found");
    }
    return sendNoContent(reply);
  } catch (error) {
    sendError(reply, error);
  }
}

export default deleteFlowerHandler;
