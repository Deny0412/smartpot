import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";

const HOUSEHOLD_DAO = require("../../dao/household/household-get-dao");

const SCHEMA = {
  type: "object",
  properties: {
    id_household: { type: "string" },
  },
  required: ["id_household"],
  additionalProperties: false,
};
interface IHouseholdGet {
  id_household: string;
}
async function getHousehold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const REQ_PARAM: IHouseholdGet = request.query as IHouseholdGet;
    const VALID = ajv.validate(SCHEMA, REQ_PARAM);
    if (!VALID) {
      reply.status(400).send({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }
    const HOUSEHOLD = await HOUSEHOLD_DAO.get(REQ_PARAM.id_household);
    reply.status(200).send({
      HOUSEHOLD,
      message: "Household retrieved successfully",
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
export default getHousehold;
