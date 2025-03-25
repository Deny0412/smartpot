import HOUSEHOLD_MODEL from "../../models/Household";
import { sendError, sendSuccess } from "../../middleware/response-handler";
import { FastifyReply } from "fastify";

async function getHousehold(id: string, reply: FastifyReply) {
  try {
    const household = await HOUSEHOLD_MODEL.findById(id);
    sendSuccess(reply, household, "Household retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default getHousehold;
