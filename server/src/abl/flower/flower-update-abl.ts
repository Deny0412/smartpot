import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao";
import { IPot } from "../../models/Flower";
import { sendSuccess, sendError, sendNotFound, sendClientError } from "../../middleware/response-handler";
import mongoose from 'mongoose';

const SCHEMA = {
    type: "object",
    properties: {
        _id: { type: "string" },
        id_profile: { type: "string" },
        name: { type: "string" },
    },
    required: ["_id", "id_profile", "name"],
    additionalProperties: false,
};

async function updatePotHandler(data: IPot, reply: FastifyReply) {
    try {
        


        const updatedPot = await potDao.updatePot(String(data._id), data);
        
        if (!updatedPot) {
            return sendNotFound(reply, "Pot not found");
        }

        return sendSuccess(reply, updatedPot, "Pot updated successfully");
    } catch (error) {
        console.error('Error updating pot:', error);
        return sendError(reply, "Failed to update pot");
    }
}

export default updatePotHandler;
