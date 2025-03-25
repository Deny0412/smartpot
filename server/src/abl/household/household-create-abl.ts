import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import householdDao from "../../dao/household/household-dao";
import { IHousehold } from "../../models/Household";
import { sendError } from "../../middleware/response-handler";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    owner: { type: "string" },
    members: { type: "array", items: { type: "string" } },
    invites: { type: "array", items: { type: "string" } },
  },
  required: ["name", "owner"],
  additionalProperties: false,
};

async function createHouseholdAbl(data: IHousehold, reply: FastifyReply) {
  try {
    const valid = ajv.validate(schema, data);
    if (!valid) {
      //sendError(reply, "BOMBA");
      throw new Error("DtoIn is not valid");
      //return;
    }
    await householdDao.createHousehold(data, reply);
  } catch (error) {
    sendError(reply, error);
  }
}

export default createHouseholdAbl;
