import { FastifyRequest, FastifyReply } from 'fastify';
import potAbl from '../abl/pot/PotAbl';
import createPotHandler from '../abl/pot/pot-create-abl';
import deletePotHandler from '../abl/pot/pot-delete-abl';
import getPotHandler from '../abl/pot/pot-get-abl';
import listPotsHandler from '../abl/pot/pot-list-abl';
import updatePotHandler from '../abl/pot/pot-update-abl';
import { sendSuccess, sendCreated, sendInternalServerError } from '../middleware/response-handler';
import { IPot } from '@/models/Pot';

export const potController = {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await potAbl.create(request.body as IPot, reply);
            sendCreated(reply, response, "Pot created successfully");
        } catch (error) {
            console.log(error);
            sendInternalServerError(reply);
        }
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
