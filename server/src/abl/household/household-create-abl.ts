import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import householdCreateDao from "../../dao/household/household-create-dao";
import { IHousehold } from "../../models/Household";
import { sendError, sendSuccess } from "../../middleware/response-handler";

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
    const newHousehold = await householdCreateDao(data);
    sendSuccess(reply, newHousehold, "Household creates successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default createHouseholdAbl;
