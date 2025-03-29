import { FastifyRequest, FastifyReply } from "fastify";
//import householdAbl from "../abl/household/household-abl";
import householdCreateAbl from "../abl/household/household-create-abl";
import householdDeleteAbl from "../abl/household/household-delete-abl";
import householdGetAbl from "../abl/household/household-get-abl";
import householdListAbl from "../abl/household/household-list-abl";
import householdUpdateAbl from "../abl/household/household-update-abl";

import { sendInternalServerError } from "../middleware/response-handler";
import { IHousehold } from "../models/Household";

interface Params {
  id: string;
}

export const householdController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reqParam = request.body as IHousehold;
      await householdCreateAbl(reqParam, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id;
      await householdDeleteAbl(id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await householdGetAbl(id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user_id = (request.body as Params).id;
      await householdListAbl(user_id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as IHousehold;
      await householdUpdateAbl(updatedHousehold, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
};
