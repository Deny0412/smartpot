import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import { sendError, sendNoContent } from "../../middleware/response-handler";
import householdDao from "../../dao/household/household-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function deleteHouseholdAbl(id: string, reply: FastifyReply) {
  try {
    const idObject = { id: id };
    const valid = ajv.validate(schema, idObject);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    await householdDao.deleteHousehold(id, reply);
  } catch (error) {
    sendError(reply, error);
  }
}
export default deleteHouseholdAbl;
