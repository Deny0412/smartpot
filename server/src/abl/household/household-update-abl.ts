import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { IHousehold } from "../../models/Household";
import { sendSuccess, sendError } from "../../middleware/response-handler";
import householdDao from "../../dao/household/household-dao";

const schema = {
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

async function updateHouseholdAbl(data: IHousehold, reply: FastifyReply) {
  try {
    /*
    const valid = ajv.validate(schema, data);
    if (!valid) {
      sendError(reply, "DtoIn is not valid");
      return;
    }
      */
    const updatedHousehold = await householdDao.updateHousehold(
      data._id as string,
      data
    );
    sendSuccess(reply, updatedHousehold, "Pot updated successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default updateHouseholdAbl;

/*
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
*/
