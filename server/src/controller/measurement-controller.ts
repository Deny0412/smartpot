import { FastifyRequest, FastifyReply } from "fastify";
import measurementCreateAbl from "../abl/measurement/measurement-create-abl";
import measurementHistoryAbl from "../abl/measurement/measurement-history-abl";

import {
  sendCreated,
  sendError,
  sendInternalServerError,
} from "../middleware/response-handler";
import { IMeasurement } from "../models/Measurement";

interface Params {
  id: string;
  dateFrom: Date;
  dateTo: Date;
}

export const measurementController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as IMeasurement;
      await measurementCreateAbl(data, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  history: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as Params;
      console.log(data);
      await measurementHistoryAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
