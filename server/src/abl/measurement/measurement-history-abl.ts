import Ajv from 'ajv'
import addFormats from 'ajv-formats'
const ajv = new Ajv()
addFormats(ajv)

import { FastifyReply } from 'fastify'
import measurementHistoryDao, { getLatestMeasurementsDao } from '../../dao/measurement/measurement-history-dao'
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'

interface MeasurementHistoryRequest {
  id: string
  householdId: string
  dateFrom?: string
  dateTo?: string
}

const schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    householdId: { type: 'string' },
    dateFrom: { type: 'string', format: 'date' },
    dateTo: { type: 'string', format: 'date' },
  },
  required: ['id', 'householdId'],
  additionalProperties: false,
}

async function measurementHistoryAbl(data: MeasurementHistoryRequest, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema)
    const valid = validate(data)

    if (!valid) {
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }

    const history = await measurementHistoryDao({
      id: data.id,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
    })

    if (!history || history.length === 0) {
      sendNotFound(reply, 'History not found')
      return
    }

    sendSuccess(reply, history, 'History retrieved successfully')
  } catch (error) {
    
    sendError(reply, error)
  }
}

async function getLatestMeasurementsAbl(data: { id: string; householdId: string }, reply: FastifyReply) {
  try {
    const validate = ajv.compile({
      type: 'object',
      properties: {
        id: { type: 'string' },
        householdId: { type: 'string' },
      },
      required: ['id', 'householdId'],
      additionalProperties: false,
    })
    const valid = validate(data)

    if (!valid) {
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }

    const latestMeasurements = await getLatestMeasurementsDao(data.id)

    if (!latestMeasurements || Object.values(latestMeasurements).every((measurement) => measurement === null)) {
      sendNotFound(reply, 'No measurements found')
      return
    }

    sendSuccess(reply, latestMeasurements, 'Latest measurements retrieved successfully')
  } catch (error) {
    console.error('Error while retrieving latest measurements', error)
    sendError(reply, error)
  }
}

export { getLatestMeasurementsAbl }
export default measurementHistoryAbl
