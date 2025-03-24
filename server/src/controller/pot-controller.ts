import { FastifyRequest, FastifyReply } from 'fastify';
import createPotHandler from '../abl/pot/pot-create-abl';
import deletePotHandler from '../abl/pot/pot-delete-abl';
import getPotHandler from '../abl/pot/pot-get-abl';
import listPotsHandler from '../abl/pot/pot-list-abl';
import updatePotHandler from '../abl/pot/pot-update-abl';
import { sendSuccess, sendError } from '../utils/response-handler';

export const potController = {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        return createPotHandler(request, reply);
    },
    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await deletePotHandler(request, reply);
            sendSuccess(reply, response, "Pot deleted successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    get: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await getPotHandler(request, reply);
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
            const response = await updatePotHandler(request, reply);
            sendSuccess(reply, response, "Pot updated successfully");
        } catch (error) {
            sendError(reply, error);
        }
    }
};
