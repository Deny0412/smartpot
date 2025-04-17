import { FastifyRequest, FastifyReply } from "fastify";
import flowerCreateAbl from "../abl/flower/flower-create-abl";
import flowerUpdateAbl from "../abl/flower/flower-update-abl";
import flowerDeleteAbl from "../abl/flower/flower-delete-abl";
import flowerListAbl from "../abl/flower/flower-list-abl";
import flowerGetAbl from "../abl/flower/flower-get-abl";
import flowerHistoryAbl from "../abl/flower/flower-history-abl";

import flowerAddMeasurementAbl from "../abl/flower/flower-measurent-add-abl";
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendInternalServerError,
} from "../middleware/response-handler";
import { IFlower } from "../models/Flower";
import { IMeasurement } from "@/models/Measurement";
import listActiveFlowersHandler from "../abl/flower/flower-list-active-abl";

interface Params {
  id: string;
  serial_number?: string;
}

interface HistoryQuery {
  flower_id: string;
}

interface QueryParams {
  page: number;
  household_id: string;
  limit: number;
}

export const flowerController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as IFlower;
      const response = await flowerCreateAbl(data, reply);
      sendCreated(reply, response, "Flower created successfully");
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerDeleteAbl(id, reply);
      // The response tis handled in the ABL layer
    } catch (error) {
      sendError(reply, error);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerGetAbl(id, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await flowerListAbl(request, reply);

      sendSuccess(reply, response, "Flowers listed successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.body as IFlower;
      const response = await flowerUpdateAbl(data, reply);
      sendSuccess(reply, response, "Flower updated successfully");
    } catch (error) {
      sendError(reply, error);
    }
  },
  history: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { flower_id } = request.query as HistoryQuery;
      if (!flower_id) {
        return sendError(reply, "Flower ID is required");
      }
      const measurementData = { flower_id } as unknown as IMeasurement;
      await flowerHistoryAbl(measurementData, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  addMeasurement: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const measurementData = request.body as IMeasurement;
      await flowerAddMeasurementAbl(measurementData, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
  listActive: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = request.query as QueryParams;
      await listActiveFlowersHandler(data, reply);
    } catch (error) {
      sendError(reply, error);
    }
  },
};
