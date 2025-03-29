import { FastifyRequest, FastifyReply } from 'fastify';
import measurementCreateAbl from '../abl/measurement/measurement-create-abl';

import { sendCreated, sendInternalServerError } from '../middleware/response-handler';
import { IMeasurement } from '../models/Measurement';

export const measurementController = {
    create: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = request.body as IMeasurement;
            const response = await measurementCreateAbl(data, reply);
            sendCreated(reply, response, "Measurement created successfully");
        } catch (error) {
            sendInternalServerError(reply);
        }
    }
    
};
