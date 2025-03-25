import { FastifyRequest, FastifyReply } from 'fastify';
import potAbl from '../abl/pot/pot-abl';

import { sendSuccess, sendCreated,sendError, sendInternalServerError } from '../middleware/response-handler';
import { IPot } from '../models/Pot';
import { IMeasurement } from '@/models/Measurement';

interface Params {
    id: string; 
}

interface HistoryQuery {
    pot_id: string;
}

export const potController = {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const potData = request.body as IPot;
            const response = await potAbl.create(potData, reply);
            sendCreated(reply, response, "Pot created successfully");
        } catch (error) {
            console.log(error);
            sendInternalServerError(reply);
        }
    },
    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const id = (request.params as Params).id;
            await potAbl.delete(id, reply);
            // The response tis handled in the ABL layer
        } catch (error) {
            sendError(reply, error);
        }
    },
    get: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await potAbl.get(request, reply);
        } catch (error) {
            sendError(reply, error);
        }
    },
    list: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await potAbl.list(request, reply);
            
            sendSuccess(reply, response, "Pots listed successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    update: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const potData = request.body as IPot;
            const response = await potAbl.update(potData, reply);
            sendSuccess(reply, response, "Pot updated successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    history: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { pot_id } = request.query as HistoryQuery;
            if (!pot_id) {
                return sendError(reply, "Pot ID is required");
            }
            const measurementData = { pot_id } as IMeasurement;
            await potAbl.history(measurementData, reply);
        } catch (error) {
            sendError(reply, error);
        }
    },
    addMeasurement: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const potData = request.body as IMeasurement;
            await potAbl.addMeasurement(potData, reply);
        } catch (error) {
            sendError(reply, error);
        }
    }
};
