import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import householdGetDao from '../../dao/household/household-get-dao'
import householdInviteDao from '../../dao/household/household-invite-dao'
import { sendClientError, sendError, sendSuccess } from '../../middleware/response-handler'
const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    invited_user_id: { type: 'string' },
  },
  required: ['id', 'invited_user_id'],
  additionalProperties: false,
}

async function householdInviteAbl(data: { id: string; invited_user_id: string }, reply: FastifyReply) {
  try {
    console.log('Received invite request with data:', data)

    const validate = ajv.compile(schema)
    const valid = validate(data)
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

    if (!Types.ObjectId.isValid(data.invited_user_id)) {
      console.log('Invalid user ID:', data.invited_user_id)
      sendClientError(reply, 'Invalid user ID')
      return
    }

    const household = await householdGetDao(data.id)
    if (!household) {
      console.log('Household not found:', data.id)
      sendClientError(reply, 'Household not found')
      return
    }

    const invitedUserObjectId = new Types.ObjectId(data.invited_user_id)
    console.log('Checking if user is already a member or has an invite')

    if (household.members.some((member) => member._id.equals(invitedUserObjectId))) {
      console.log('User is already a member')
      sendClientError(reply, 'User is already a member')
      return
    }

    if (household.invites.some((invite) => invite._id.equals(invitedUserObjectId))) {
      console.log('User already has an invite')
      sendClientError(reply, 'User already has an invite')
      return
    }

    if (household.owner.equals(invitedUserObjectId)) {
      console.log('User is the owner')
      sendClientError(reply, 'User is the owner')
      return
    }

    console.log('Sending invite to user')
    const updatedHousehold = await householdInviteDao(data.id, data.invited_user_id)

    if (!updatedHousehold) {
      console.log('Failed to update household')
      sendError(reply, new Error('Failed to update household'))
      return
    }

    console.log('Invite sent successfully')
    sendSuccess(reply, updatedHousehold, 'Invite sent successfully')
  } catch (error) {
    console.error('Error while sending invite', error)
    sendError(reply, error)
  }
}

export default householdInviteAbl
