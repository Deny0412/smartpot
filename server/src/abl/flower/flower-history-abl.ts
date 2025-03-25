import { FastifyReply } from "fastify";
import { IMeasurement } from "@/models/Measurement";
import { sendClientError, sendSuccess } from "../../middleware/response-handler";
import flowerDao from "../../dao/flower/flower-dao";

async function flowerHistoryHandler(data: IMeasurement, reply: FastifyReply) {
    try {
        // Validate required fields
        if (!data.flower_id) {
            sendClientError(reply, "Flower ID is required");
            return;
        }
        // Get flower history from DAO
        const history = await flowerDao.getFlowerHistory(data.flower_id);
        
        return sendSuccess(reply, history, "Flower history retrieved successfully");
    } catch (error) {
        throw error;
    }
}

export default flowerHistoryHandler; 