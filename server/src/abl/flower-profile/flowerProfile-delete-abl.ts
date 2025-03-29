import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendNoContent,
} from "../../middleware/response-handler";
import flowerProfileDeleteDao from "../../dao/flower-profile/flowerProfile-delete-dao";

const schema = {
  type: "object",
  properties: {
    flowerProfile_id: { type: "string" },
  },
  required: ["flowerProfile_id"],
  additionalProperties: false,
};

async function flowerProfileDeleteAbl(id: string, reply: FastifyReply) {
  try {
    const idObject = { flowerProfile_id: id };
    const valid = ajv.validate(schema, idObject);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    await flowerProfileDeleteDao(id);
    sendNoContent(reply, "Flower profile deleted successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default flowerProfileDeleteAbl;
