import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import householdDao from "../../dao/household/household-dao";

const schema = {
  type: "object",
  properties: {
    user_id: { type: "string" },
  },
  required: ["user_id"],
  additionalProperties: false,
};

async function listHouseholdAbl(user_id: string, reply: FastifyReply) {
  try {
    const idObject = { id: user_id };
    const valid = ajv.validate(schema, idObject);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    await householdDao.listHousehold(user_id, reply);
  } catch (error) {
    sendError(reply, error);
  }
}
export default listHouseholdAbl;
