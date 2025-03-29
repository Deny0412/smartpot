import { FastifyRequest, FastifyReply } from "fastify";
import householdAbl from "../abl/household/household-abl";
import { sendInternalServerError } from "../middleware/response-handler";
import { IHousehold } from "../models/Household";

interface Params {
  id: string;
}

export const householdController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reqParam = request.body as IHousehold;
      await householdAbl.createHousehold(reqParam, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id;
      await householdAbl.deleteHousehold(id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await householdAbl.getHousehold(id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user_id = (request.body as Params).id;
      await householdAbl.listHousehold(user_id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as IHousehold;
      await householdAbl.updateHousehold(updatedHousehold, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
};
