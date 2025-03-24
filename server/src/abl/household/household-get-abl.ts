import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import householdDao from "../../dao/household/household-dao";

const schema = {
  type: "object",
  properties: {
    id_household: { type: "string" },
  },
  required: ["id_household"],
  additionalProperties: false,
};

async function getHouseholdAbl(id: string, reply: FastifyReply) {
  try {
    // Wrap `id` in an object before validation
    const idObject = { id_household: id };

    const valid = ajv.validate(schema, idObject);
    if (!valid) {
      sendError(reply, "DtoIn is not valid");
      return;
    }

    const household = await householdDao.getHousehold(id);
    sendSuccess(reply, household, "Household retrieved successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default getHouseholdAbl;
