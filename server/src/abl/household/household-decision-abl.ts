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
    console.log('Decision request data:', data)
    console.log('User ID:', user_id)

    const validate = ajv.compile(schema)
    const valid = validate(data)
    if (!valid) {
      console.log('Validation errors:', validate.errors)
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }

    if (!Types.ObjectId.isValid(data.id)) {
      console.log('Invalid household ID:', data.id)
      sendClientError(reply, 'Neplatné ID domácnosti')
      return
    }

    if (!Types.ObjectId.isValid(user_id)) {
      console.log('Invalid user ID:', user_id)
      sendClientError(reply, 'Neplatné ID používateľa')
      return
    }

    const household = await householdGetDao(data.id)
    if (!household) {
      console.log('Household not found:', data.id)
      sendClientError(reply, 'Domácnosť neexistuje')
      return
    }

    const userObjectId = new Types.ObjectId(user_id)
    console.log('Checking if user is already a member or has an invite')

    if (household.members.some((member) => member._id.equals(userObjectId))) {
      console.log('User is already a member')
      sendClientError(reply, 'Používateľ je už členom domácnosti')
      return
    }

    if (!household.invites.some((invite) => invite._id.equals(userObjectId))) {
      console.log('User does not have an invite')
      sendClientError(reply, 'Používateľ nemá pozvánku')
      return
    }

    console.log('Processing decision')
    const updatedHousehold = await householdDecisionDao(data.id, user_id, data.decision)

    if (!updatedHousehold) {
      console.log('Failed to update household')
      sendError(reply, new Error('Nepodarilo sa aktualizovať domácnosť'))
      return
    }

    console.log('Decision processed successfully')
    sendSuccess(reply, updatedHousehold, data.decision ? 'Pozvánka bola prijatá' : 'Pozvánka bola zamietnutá')
  } catch (error) {
    console.error('Error in householdDecisionAbl:', error)
    sendError(reply, error)
  }
}

export default householdDecisionAbl
