import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import flowerProfileListDao from "../../dao/flower-profile/flowerProfile-list-dao";

/*
const schema = {
  type: "object",
  properties: {
    user_id: { type: "string" },
  },
  required: ["user_id"],
  additionalProperties: false,
};
*/

async function flowerProfileListAbl(reply: FastifyReply) {
  try {
    const listHousehold = await flowerProfileListDao();
    sendSuccess(reply, listHousehold, "Flower profiles listed successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileListAbl;
