import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import { FastifyReply } from "fastify";

async function updateHousehold(
  id: string,
  data: IHousehold,
  reply: FastifyReply
) {
  try {
    const updatedHousehold = await HOUSEHOLD_MODEL.findByIdAndUpdate(id, data, {
      new: true,
    });
    sendSuccess(reply, updatedHousehold, "Household updated successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default updateHousehold;
