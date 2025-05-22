import Ajv from "ajv";
import addFormats from "ajv-formats";
const ajv = new Ajv();
addFormats(ajv);

import { FastifyReply } from "fastify";
import {
  sendSuccess,
  sendError,
  sendClientError,
  sendNotFound,
} from "../../middleware/response-handler";
import latestMeasurementsDao from "../../dao/measurement/measurement-latest-history-dao";


const schema = {
    type: "object",
    properties: {
      id: { type: "string" },
      typeOfData: {
        type: "string",
        enum: ["humidity", "water", "temperature", "light" , "battery"]
      },
      dateFrom: { type: "string", format: "date" },
      dateTo: { type: "string", format: "date" },
    },
    required: ["id", "typeOfData"],
    additionalProperties: false,
  };
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
  
      const latestMeasurements = await latestMeasurementsDao(data.id)
  
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
export default getLatestMeasurementsAbl;
