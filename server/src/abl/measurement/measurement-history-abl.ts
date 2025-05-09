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
      sendNotFound(reply, 'História meraní neexistuje')
      return
    }

    sendSuccess(reply, history, 'História meraní bola úspešne načítaná')
  } catch (error) {
    console.error('Chyba pri spracovaní histórie meraní:', error)
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
      sendNotFound(reply, 'Žiadne merania neboli nájdené')
      return
    }

    sendSuccess(reply, latestMeasurements, 'Posledné merania boli úspešne načítané')
  } catch (error) {
    console.error('Chyba pri spracovaní posledných meraní:', error)
    sendError(reply, error)
  }
}

export { getLatestMeasurementsAbl }
export default measurementHistoryAbl
