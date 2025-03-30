import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import smartpotUpdateDao from "../../dao/smartpot/smart-pot-update-dao";
import { ISmartPot } from "../../models/SmartPot";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
import checkFlowerExists from "../../dao/flower/flower-exists-dao";
async function updateSmartPotHandler(data: ISmartPot, reply: FastifyReply) {
  try {
    const active_flower_id_validated = MongoValidator.validateId(data.active_flower_id.toString());
    if (!active_flower_id_validated) {
      return sendClientError(reply, "Invalid flower ID format");
    }
    const existsFlower = await checkFlowerExists(data.active_flower_id.toString());
    if (!existsFlower) {
      return sendNotFound(reply, "Flower not found");
    }
    const updatedSmartPot = await smartpotUpdateDao(String(data.serial_number), data);

    if (!updatedSmartPot) {
      return sendNotFound(reply, "SmartPot not found");
    }

    return sendSuccess(reply, updatedSmartPot, "SmartPot updated successfully");
  } catch (error) {
    
    return sendError(reply, "Failed to update smartpot");
  }
}

export default updateSmartPotHandler;