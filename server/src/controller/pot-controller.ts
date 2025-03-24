import { FastifyRequest, FastifyReply } from 'fastify';
import potAbl from '../abl/pot/pot-abl';

import listPotsHandler from '../abl/pot/pot-list-abl';
import { sendSuccess, sendCreated,sendError, sendInternalServerError } from '../middleware/response-handler';
import { IPot } from '../models/Pot';

interface Params {
    id: string; 
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
            const response = await potAbl.delete(id, reply);
            sendSuccess(reply, response, "Pot deleted successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    get: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await potAbl.get(request, reply);
            sendSuccess(reply, response, "Pot retrieved successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    list: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await listPotsHandler(request, reply);
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
    }
};
