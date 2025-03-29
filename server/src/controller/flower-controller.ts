import { FastifyRequest, FastifyReply } from 'fastify';
import flowerAbl from '../abl/flower/flower-abl';

import { sendSuccess, sendCreated,sendError, sendInternalServerError } from '../middleware/response-handler';
import { IFlower } from '../models/Flower';
import { IMeasurement } from '@/models/Measurement';

interface Params {
    id: string; 
}

interface HistoryQuery {
    flower_id: string;
}

export const flowerController = {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as IFlower;
            const response = await flowerAbl.create(data, reply);
            sendCreated(reply, response, "Flower created successfully");
        } catch (error) {
            sendInternalServerError(reply);
        }
    },
    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const id = (request.params as Params).id;
            await flowerAbl.delete(id, reply);
            // The response tis handled in the ABL layer
        } catch (error) {
            sendError(reply, error);
        }
    },
    get: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await flowerAbl.get(request, reply);
        } catch (error) {
            sendError(reply, error);
        }
    },
    list: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await flowerAbl.list(request, reply);
            
            sendSuccess(reply, response, "Flowers listed successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    update: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as IFlower;
            const response = await flowerAbl.update(data, reply);
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
            await flowerAbl.history(measurementData, reply);
        } catch (error) {
            sendError(reply, error);
        }
    },
    addMeasurement: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const measurementData = request.body as IMeasurement;
            await flowerAbl.addMeasurement(measurementData, reply);
        } catch (error) {
            sendError(reply, error);
        }
    }
};
