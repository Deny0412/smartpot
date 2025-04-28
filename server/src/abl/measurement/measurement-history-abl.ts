import Ajv from 'ajv'
import addFormats from 'ajv-formats'
const ajv = new Ajv()
addFormats(ajv)

import { FastifyReply } from 'fastify'
import measurementHistoryDao from '../../dao/measurement/measurement-history-dao'
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

export default measurementHistoryAbl
