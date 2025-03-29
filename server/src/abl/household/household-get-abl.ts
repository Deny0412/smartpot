import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function getHouseholdAbl(id: string, reply: FastifyReply) {
  try {
    const idObject = { id: id };
    const valid = ajv.validate(schema, idObject);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    const household = await householdGetDao(id);
    sendSuccess(reply, household, "Household retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default getHouseholdAbl;
