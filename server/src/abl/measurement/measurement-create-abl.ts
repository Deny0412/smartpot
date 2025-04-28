import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { FastifyReply } from 'fastify'
import createMeasurement from '../../dao/measurement/measurement-create-dao'
import { sendClientError, sendCreated, sendError } from '../../middleware/response-handler'
import { IMeasurement } from '../../models/Measurement'

const ajv = new Ajv()
addFormats(ajv)

const schema = {
  type: 'object',
  properties: {
    flower_id: { type: 'string' },
    humidity: { type: ['number', 'null'] },
    water_level: { type: ['number', 'null'] },
    temperature: { type: ['number', 'null'] },
    light: { type: ['number', 'null'] },
  },
  required: ['flower_id'],
  additionalProperties: false,
}

async function createMeasurementAbl(data: IMeasurement, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema)
    const valid = validate(data)

    if (!valid) {
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }

    const createdMeasurement = await createMeasurement(data)
    sendCreated(reply, createdMeasurement, 'Measurement created successfully')
  } catch (error) {
    sendError(reply, error)
  }
}

export default createMeasurementAbl
