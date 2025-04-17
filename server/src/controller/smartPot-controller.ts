import { FastifyRequest, FastifyReply } from "fastify";
import smartpotCreateAbl from "../abl/smartpot/smartpot-create-abl";
import smartpotGetAbl from "../abl/smartpot/smartpot-get-abl";
import smartpotGetCurrentAbl from "../abl/smartpot/smartpot-getCurrentFlower-abl";
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendInternalServerError,
} from "../middleware/response-handler";
import { ISmartPot } from "../models/SmartPot";
import SmartPotAblUpdate from "../abl/smartpot/smartPot-update-abl";

interface Params {
  id: string;
}
export const smartpotController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISmartPot;
      const response = await smartpotCreateAbl(data, reply);
      sendCreated(reply, response, "SmartPot created successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      const response = await smartpotGetAbl(id, reply);
      sendSuccess(reply, response, "SmartPot retrieved successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
  getCurrentFlower: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const serial_number = (request.params as Params).id;
      await smartpotGetCurrentAbl(serial_number, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user;
      const data = request.body as ISmartPot;
      const response = await SmartPotAblUpdate(data, reply);
      sendSuccess(reply, response, "SmartPot updated successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
};
