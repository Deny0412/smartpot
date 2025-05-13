import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import householdDecisionDao from '../../dao/household/household-decision-dao'
import householdGetDao from '../../dao/household/household-get-dao'
import { sendClientError, sendError, sendSuccess } from '../../middleware/response-handler'

const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    decision: { type: 'boolean' },
  },
  required: ['id', 'decision'],
  additionalProperties: false,
}

async function householdDecisionAbl(data: { id: string; decision: boolean }, user_id: string, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    const logged_user = new Types.ObjectId(user_id);
    if (!valid) {
      console.log('Validation errors:', validate.errors)
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }

    if (!Types.ObjectId.isValid(data.id)) {
      console.log('Invalid household ID:', data.id)
      sendClientError(reply, 'Invalid household ID')
      return
    }

    if (!Types.ObjectId.isValid(user_id)) {
      console.log('Invalid user ID:', user_id)
      sendClientError(reply, 'Invalid user ID')
      return
    }

    const household = await householdGetDao(data.id)
    if (!household) {
      console.log('Household not found:', data.id)
      sendClientError(reply, 'Household not found')
      return
    }
    if (household?.members.some((member) => member._id.equals(logged_user))) {
      sendClientError(reply, "User is not member");
      return;
    }
    if (!household?.invites.some((invite) => invite._id.equals(logged_user))) {
      sendClientError(
        reply,
        "User that is logged in is not invited to the household"
      );
      return;
    }
    const updatedHousehold = await householdDecisionDao(
      String(data.id),
      String(logged_user),
      Boolean(data.decision)
    );
    sendSuccess(reply, updatedHousehold, "User decided successfully");
  } catch (error) {
    console.error('Error in householdDecisionAbl:', error)
    sendError(reply, error)
  }
}

export default householdDecisionAbl
