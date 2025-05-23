import { IFlower } from '@/models/Flower'
import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import getFlower from '../../dao/flower/flower-get-dao'
import getHousehold from '../../dao/household/household-get-dao'
import createMeasurement from '../../dao/measurement/measurement-create-dao'
import getSmartpot from '../../dao/smartpot/smartpot-getBySerial-dao'
import getUser from '../../dao/user/user-get-dao'
import { sendClientError, sendCreated, sendError } from '../../middleware/response-handler'
import { sendToMultipleUsers } from '../../plugins/websocket/sender'
import notificationService from '../../services/notification-service'
import { isValueOutOfRange } from '../../utils/flower/flower-range-util'
const schema = {
  type: 'object',
  properties: {
    smartpot_serial: { type: 'string' },
    typeOfData: {
      type: 'string',
      enum: ['soil', 'water', 'temperature', 'light', 'battery'],
    },
    value: {
      anyOf: [{ type: 'number' }, { type: 'string' }],
    },
  },
  required: ['smartpot_serial', 'typeOfData', 'value'],
}

const ajv = new Ajv()

async function measurementCreateAbl(data: any, reply: FastifyReply, user: any) {
  try {
    const validate = ajv.compile(schema)
    const valid = validate(data)
    if (!valid) {
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }

    const smartpot = await getSmartpot(data.smartpot_serial as string)
    if (!smartpot) {
      sendClientError(reply, 'Smart pot does not exist')
      return
    }

    const activeFlowerId = smartpot?.active_flower_id
    if (!activeFlowerId) {
      sendClientError(reply, 'Smart pot does not have active flower')
      return
    }
    const household = await getHousehold(String(smartpot?.household_id))
    if (!household) {
      sendClientError(reply, 'Smart pot does not have assigned household')
      return
    }
    if (data.typeOfData === 'water') {
      if (typeof data.value !== 'string') {
        return sendClientError(reply, `value must be a string for typeOfData water`)
      }
      data.value = (data.value as string).toLowerCase()
    } else {
      if (typeof data.value !== 'number') {
        return sendClientError(reply, `value must be a number for typeOfData ${data.typeOfData}`)
      }
    }

    const flower = await getFlower(String(activeFlowerId))
    const rangeCheckResult = isValueOutOfRange(data.typeOfData as string, data.value as number, flower as IFlower)
    const householdOwner = await getUser(String(household?.owner))
    const memberIds = household?.members || []
    const members = (await Promise.all(memberIds.map((id) => getUser(String(id))))).filter((user) => user?.email)

    const usersToNotify = [...members]
    if (householdOwner) {
      usersToNotify.push(householdOwner)
    }
    if (rangeCheckResult && rangeCheckResult.outOfRange) {
      sendToMultipleUsers(usersToNotify, rangeCheckResult)
      notificationService.sendEmailNotification(usersToNotify, rangeCheckResult.message, rangeCheckResult)
      notificationService.sendDiscordNotification(rangeCheckResult.message, rangeCheckResult)
      console.log(`Sending notification: ${rangeCheckResult.message}`)
    }
    sendToMultipleUsers(usersToNotify, data)

    data.flower_id = new Types.ObjectId(String(activeFlowerId))
    console.log('Creating measurement with data:', JSON.stringify(data, null, 2))
    const createdMeasurement = await createMeasurement(data)
    console.log('Created measurement:', JSON.stringify(createdMeasurement, null, 2))
    sendCreated(reply, createdMeasurement, 'Measurement created successfully')
  } catch (error) {
    sendError(reply, error)
  }
}

export default measurementCreateAbl
