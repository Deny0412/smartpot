import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import { sendError, sendNoContent } from "../../middleware/response-handler";
import householdDao from "../../dao/household/household-dao";

const schema = {
  type: "object",
  properties: {
    id_household: { type: "string" },
  },
  required: ["id_household"],
  additionalProperties: false,
};

async function deleteHouseholdAbl(id: string, reply: FastifyReply) {
  try {
    const valid = ajv.validate(schema, id);
    if (!valid) {
      sendError(reply, "DtoIn is not valid");
      return;
    }
    await householdDao.deleteHousehold(id);
    sendNoContent(reply, "Household deleted successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default deleteHouseholdAbl;

/*
async function deleteHousehold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const REQ_PARAM: IHouseholdDelete = request.body as IHouseholdDelete;
    const VALID = ajv.validate(SCHEMA, REQ_PARAM);
    if (!VALID) {
      reply.status(400).send({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }
    await HOUSEHOLD_DAO.delete(REQ_PARAM.id_household);
    reply
      .status(200)
      .send({ message: "Household deleted successfully", status: "success" });
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
export default deleteHousehold;
*/
