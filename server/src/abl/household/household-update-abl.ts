import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { IHousehold } from "../../models/Household";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import householdDao from "../../dao/household/household-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    owner: { type: "string" },
    members: { type: "array", items: { type: "string" } },
    invites: { type: "array", items: { type: "string" } },
  },
  required: ["id"],
  additionalProperties: false,
};

async function updateHouseholdAbl(data: IHousehold, reply: FastifyReply) {
  try {
    const valid = ajv.validate(schema, data);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    await householdDao.updateHousehold(data.id as string, data, reply);
  } catch (error) {
    sendError(reply, error);
  }
}
export default updateHouseholdAbl;
