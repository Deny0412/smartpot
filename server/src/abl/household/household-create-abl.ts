import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";

const HOUSEHOLD_DAO = require("../../dao/household/household-create-dao");
import { IHousehold } from "../../models/Household";

const SCHEMA = {
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

async function createHousehold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const REQ_PARAM: IHousehold = request.body as IHousehold;

    REQ_PARAM.members = REQ_PARAM.members || [];
    REQ_PARAM.invites = REQ_PARAM.invites || [];

    const VALID = ajv.validate(SCHEMA, REQ_PARAM);
    if (!VALID) {
      reply.status(400).send({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }
    const CREATED_HOUSEHOLD = await HOUSEHOLD_DAO.create(REQ_PARAM);
    reply.status(200).send({
      CREATED_HOUSEHOLD,
      message: "Household created successfully",
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

export default createHousehold;
