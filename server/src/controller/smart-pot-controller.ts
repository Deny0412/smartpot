import { FastifyRequest, FastifyReply } from 'fastify';
import smartpotAbl from '../abl/smartpot/smart-pot-abl';

import { sendSuccess, sendCreated,sendError, sendInternalServerError } from '../middleware/response-handler';
import { ISmartPot } from '../models/SmartPot';

interface Params {
    id: string; 
}
export const smartpotController = {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as ISmartPot;
            const response = await smartpotAbl.create(data, reply);
            sendCreated(reply, response, "SmartPot created successfully");
        } catch (error) {
            sendError(reply, error);
        }
    },
    get: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const id = (request.params as Params).id;
            const response = await smartpotAbl.get(id, reply);
            sendSuccess(reply, response, "SmartPot retrieved successfully");
        } catch (error) {
            sendError(reply, error);
        }
    }
};
