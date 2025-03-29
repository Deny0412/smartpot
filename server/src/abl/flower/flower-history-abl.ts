import { FastifyReply } from "fastify";
import { IMeasurement } from "@/models/Measurement";
import { sendClientError, sendSuccess } from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
import getFlowerHistory from "../../dao/flower/flower-history-dao";
async function flowerHistoryHandler(data: IMeasurement, reply: FastifyReply) {
    try {
        const validate = MongoValidator.validateId(data.flower_id.toString());
        if(!validate){
            sendClientError(reply, "Invalid flower ID format");
            return;
        }
        // Validate required fields
        if (!data.flower_id) {
            sendClientError(reply, "Flower ID is required");
            return;
        }
        // Get flower history from DAO
        const history = await getFlowerHistory(data.flower_id.toString());
        
        return sendSuccess(reply, history, "Flower history retrieved successfully");
    } catch (error) {
        throw error;
    }
}

export default flowerHistoryHandler; 