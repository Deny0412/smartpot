import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import flowerProfileListDao from "../../dao/flower-profile/flowerProfile-list-dao";

async function flowerProfileListAbl(reply: FastifyReply) {
  try {
    const listHousehold = await flowerProfileListDao();
    sendSuccess(reply, listHousehold, "Flower profiles listed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileListAbl;
