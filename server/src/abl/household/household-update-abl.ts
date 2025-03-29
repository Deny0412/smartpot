import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { IHousehold } from "../../models/Household";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import householdUpdateDao from "../../dao/household/household-update-dao";

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

async function householdUpdateAbl(data: IHousehold, reply: FastifyReply) {
  try {
    const valid = ajv.validate(schema, data);
    if (!valid) {
      throw new Error("DtoIn is not valid");
    }
    const updatedHousehold = await householdUpdateDao(data.id as string, data);
    return sendSuccess(
      reply,
      updatedHousehold,
      "Household updated successfully"
    );
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdUpdateAbl;
