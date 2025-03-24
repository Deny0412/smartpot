import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";

const HOUSEHOLD_DAO = require("../../dao/household/household-update-dao");

const SCHEMA = {
  type: "object",
  properties: {
    id_household: { type: "string" },
    name: { type: "string" },
    owner: { type: "string" },
    members: { type: "array", items: { type: "string" } },
    invites: { type: "array", items: { type: "string" } },
  },
  required: ["id_household"],
  additionalProperties: false,
};
interface IHouseholdUpdate {
  id_household: string;
  name?: string;
  owner?: string;
  members?: string[];
  invites?: string[];
}

async function updateHousehold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const REQ_PARAM: IHouseholdUpdate = request.body as IHouseholdUpdate;

    const VALID = ajv.validate(SCHEMA, REQ_PARAM);
    if (!VALID) {
      reply.status(400).send({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }
    const HOUSEHOLD_ID = REQ_PARAM.id_household;
    const UPDATED_HOUSEHOLD = await HOUSEHOLD_DAO.update(
      HOUSEHOLD_ID,
      REQ_PARAM
    );
    reply.status(200).send({
      UPDATED_HOUSEHOLD,
      message: "Household updated successfully",
      status: "success",
    });
  } catch (error) {
    if (error instanceof Error) {
      reply.status(500).send({ message: error.message, status: "error" });
    } else {
      reply
        .status(500)
        .send({ message: "Unknown error occurred", status: "error" });
    }
  }
}
export default updateHousehold;
