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
import smartpotGetBySerialNumberDao from "../../dao/smartpot/smart-pot-get-by-serial-number";
import smartpotUpdateActiveFlowerDao from "../../dao/smartpot/smart-pot-update-dao";
import flowerGetDao from "../../dao/flower/flower-get-dao";
import updateSmartPot from "../../dao/smartpot/smart-pot-update-dao";
const SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    profile_id: { type: "string", required: false },
    name: { type: "string" },
    serial_number: { type: "string",required: false},
    household_id: { type: "string", required: false },
  },
  required: ["id"],
  additionalProperties: false,
};

async function updateFlowerHandler(data: IFlower, reply: FastifyReply) {
  try {
    const valid = MongoValidator.validateId(data.id);
    if (!valid) {
      return sendClientError(reply, "Invalid flower ID format");
    }
    if (data.profile_id) {
      const profile_id_validated = MongoValidator.validateId(data.profile_id);
      if (!profile_id_validated) {
        return sendClientError(reply, "Invalid profile ID format");
      }
    }
    if (data.profile_id) {
      const doesFlowerProfileExist = await flowerProfileGetDao(data.profile_id);
      if (!doesFlowerProfileExist) {
        sendClientError(reply, "Flower profile does not exist");
        return;
      }
    }
    //TODO: Check if serial number exists
    if(data.serial_number){
    const doesSerialNumberExist = await smartpotGetBySerialNumberDao(
        data.serial_number
    );
    if (!doesSerialNumberExist) {
      sendClientError(
        reply,
        "Smart pot with pasted serial number does not exist"
      );
      return;
    }
    }

    
    const old_flower = await flowerGetDao(data.id);

    const old_serial_number = old_flower?.serial_number;
    const old_smart_pot = await smartpotGetBySerialNumberDao(
      String(old_serial_number)
    );
    const new_smart_pot = await smartpotGetBySerialNumberDao(
      String(data.serial_number)
    );
    //Logic for when the flower is moved to a different smartpot
    if (
      old_smart_pot?.active_flower_id?.toString() ===
        old_flower?._id?.toString() &&
      old_flower?.serial_number.toString() ===
        old_smart_pot?.serial_number.toString()
    ) {
      old_smart_pot.active_flower_id = null;
      const updatedSmartpot = await updateSmartPot(old_smart_pot);
    }
    
    
    if(new_smart_pot?.household_id.toString()!==old_flower?.household_id.toString() &&!data.household_id){
      sendClientError(reply, "Flower must be from the same household as the smartpot");
      return;
    }
    
    if(data.serial_number&&data.household_id&&new_smart_pot?.household_id.toString()!==data.household_id.toString()){
      sendClientError(reply, "Flower must be from the same household as the smartpot");
      return;
    }
    if(data.household_id&&!data.serial_number&&data.household_id!==old_flower?.household_id){
    data.serial_number=null;
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
