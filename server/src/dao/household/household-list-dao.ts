import HOUSEHOLD_MODEL from "../../models/Household";
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";

async function listHousehold(user_id: string, reply: FastifyReply) {
  try {
    const householdFiltered = await HOUSEHOLD_MODEL.find({
      $or: [{ owner: user_id }, { members: user_id }],
    });
    sendSuccess(reply, householdFiltered, "Households listed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default listHousehold;
