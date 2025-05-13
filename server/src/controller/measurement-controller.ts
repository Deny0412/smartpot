import { FastifyRequest, FastifyReply } from "fastify";
import measurementCreateAbl from "../abl/measurement/measurement-create-abl";
import measurementHistoryAbl from "../abl/measurement/measurement-history-abl";

import { sendError } from "../middleware/response-handler";

interface Params {
  id: string;
  dateFrom: Date;
  dateTo: Date;
}

export const measurementController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as Object;
      const user = request.user as Object;
      await measurementCreateAbl(data, reply, user);
    } catch (error) {
      sendError(reply, error);
    }
  },
  history: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as Params;
      await measurementHistoryAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
