import HOUSEHOLD_MODEL from "../../models/Household";
import { FastifyReply } from "fastify";
import { sendError, sendNoContent } from "../../middleware/response-handler";

async function deleteHousehold(id: string, reply: FastifyReply) {
  try {
    await HOUSEHOLD_MODEL.findByIdAndDelete(id);
    sendNoContent(reply, "Household deleted successfully");
    return;
  } catch (error) {
    sendError(reply, error);
  }
}

export default deleteHousehold;
