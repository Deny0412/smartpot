import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";
import { FastifyReply } from "fastify";
import { sendCreated, sendError } from "../../middleware/response-handler";

async function createHousehold(data: IHousehold, reply: FastifyReply) {
  try {
    const createdHousehold = await HOUSEHOLD_MODEL.create(data);
    sendCreated(reply, createdHousehold, "Household created successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default createHousehold;
