import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyReply } from "fastify";
import { Types } from "mongoose";

import {
  sendError,
  sendClientError,
  sendSuccess,
  //sendNoContent,
  sendNotFound,
} from "../../middleware/response-handler";
import householdDecisionDao from "../../dao/household/household-decision-dao";
import householdGetDao from "../../dao/household/household-get-dao";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    decision: { type: "boolean" },
    invited_user_id: { type: "string" },
  },
  required: ["id", "decision", "invited_user_id"],
  additionalProperties: false,
};

async function householdDecisionAbl(data: Object, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const household = await householdGetDao(String(data.id));
    if (!household) {
      sendNotFound(reply, "Household does not exist");
    }

    const invitedUserObjectId = new Types.ObjectId(
      String(data.invited_user_id)
    );

    if (
      household?.members.some((member) =>
        member._id.equals(invitedUserObjectId)
      )
    ) {
      //sendClientError(reply, "User is not member");
      throw new Error("User is already member");
    }
    const updatedHousehold = await householdDecisionDao(
      String(data.id),
      String(data.invited_user_id),
      Boolean(data.decision)
    );
    sendSuccess(reply, updatedHousehold, "User decided successfully");
  } catch (error) {
    sendError(reply, error);
  }
}
export default householdDecisionAbl;
