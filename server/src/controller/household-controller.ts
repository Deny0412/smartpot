import { FastifyRequest, FastifyReply } from "fastify";
import householdAbl from "../abl/household/household-abl";
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendInternalServerError,
} from "../middleware/response-handler";
import { IHousehold } from "../models/Household";

interface Params {
  id: string;
}

export const householdController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reqParam = request.body as IHousehold;
      const newHousehold = await householdAbl.createHousehold(reqParam, reply);
      sendCreated(reply, newHousehold, "Household created successfully");
    } catch (error) {
      console.log(error);
      sendInternalServerError(reply);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id;
      await householdAbl.deleteHousehold(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      const response = await householdAbl.getHousehold(id, reply);
      sendSuccess(reply, response, "Household retrieved successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as IHousehold;
      const response = await householdAbl.updateHousehold(
        updatedHousehold,
        reply
      );
      sendSuccess(reply, response, "Household updated successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
};
