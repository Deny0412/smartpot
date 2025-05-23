import { FastifyRequest, FastifyReply } from "fastify";

import userSearchAbl from "../abl/user/user-search-abl";

import { sendError } from "../middleware/response-handler";

interface Params {
  id: string;
  query?: string;
}

export const userController = {
  search: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = (request.query as Params).query!;
      await userSearchAbl(query, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
