import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";

const HOUSEHOLD_DAO = require("../../dao/household/household-list-dao");

const SCHEMA = {
  type: "object",
  properties: {
    id_user: { type: "string" },
  },
  required: [],
  additionalProperties: false,
};
interface IHouseholdList {
  id_user: string;
}
async function listHousehold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const REQ_PARAM: IHouseholdList = request.query as IHouseholdList;
    const VALID = ajv.validate(SCHEMA, REQ_PARAM);
    if (!VALID) {
      reply.status(400).send({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }
    const HOUSEHOLDS = await HOUSEHOLD_DAO.get(REQ_PARAM.id_user);
    reply.status(200).send({
      HOUSEHOLDS,
      message: "Households listed successfully",
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
export default listHousehold;
