import { FastifyRequest, FastifyReply } from "fastify";
import smartpotCreateAbl from "../abl/smartpot/smartpot-create-abl";
import smartpotGetAbl from "../abl/smartpot/smartpot-get-abl";
import smartpotGetCurrentAbl from "../abl/smartpot/smartpot-getCurrentFlower-abl";
import { sendError } from "../middleware/response-handler";
import { ISmartPot } from "../models/SmartPot";
import smartpotUpdateAbl from "../abl/smartpot/smartPot-update-abl";

interface Params {
  id: string;
}
export const smartpotController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as ISmartPot;
      await smartpotCreateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await smartpotGetAbl(id, reply);
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
      const data = request.body as ISmartPot;
      await smartpotUpdateAbl(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
