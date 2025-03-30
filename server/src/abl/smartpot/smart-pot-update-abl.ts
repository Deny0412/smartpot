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
import checkFlowerExists from "../../dao/flower/flower-exists-dao";
import householdGetDao from "../../dao/household/household-get-dao";
import mongoose from "mongoose";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const schema = {
  type: "object",
  properties: {
    serial_number: { type: "string" },
    active_flower_id: { type: "string" },
    household_id: { type: "string" },
  },
  required: ["serial_number"],
};

async function updateSmartPotHandler(data: ISmartPot, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
        const valid = validate(data);
        if(!valid){
            sendClientError(reply, JSON.stringify(validate.errors?.map(error => error.message)));
            return;
        }
    // Validate IDs format

    if (data.active_flower_id && !isValidObjectId(data.active_flower_id.toString())) {
      sendClientError(reply, "Invalid active_flower_id format");
      return;
    }

    if (data.household_id && !isValidObjectId(data.household_id.toString())) {
      sendClientError(reply, "Invalid household_id format");
      return;
    }

    // Validate household if provided
    if (data.household_id) {
      const existsHousehold = await householdGetDao(String(data.household_id));
      if (!existsHousehold) {
        console.log("Household not found");
        sendNotFound(reply, "Household not found");
        return;
      }
    }

    // Validate active flower if provided
    if (data.active_flower_id) {
      const existsFlower = await checkFlowerExists(String(data.active_flower_id));
      if (!existsFlower) {
        sendNotFound(reply, "Active flower not found");
        return;
      }
    }

    // Update the smartpot
    const updatedSmartPot = await smartpotUpdateDao(data);
    if (!updatedSmartPot) {
      sendNotFound(reply, "SmartPot not found");
      return;
    }

    // Send success response
    sendSuccess(reply, updatedSmartPot, "SmartPot updated successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default updateSmartPotHandler;
