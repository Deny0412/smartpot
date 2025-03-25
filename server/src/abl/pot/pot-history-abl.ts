import { FastifyReply } from "fastify";
import { IMeasurement } from "@/models/Measurement";
import { sendClientError, sendSuccess } from "../../middleware/response-handler";
import potDao from "../../dao/pot/pot-dao";

async function potHistoryHandler(data: IMeasurement, reply: FastifyReply) {
    try {
        // Validate required fields
        if (!data.pot_id) {
            sendClientError(reply, "Pot ID is required");
            return;
        }

        // Get pot history from DAO
        const history = await potDao.getPotHistory(data.pot_id);
        
        return sendSuccess(reply, history, "Pot history retrieved successfully");
    } catch (error) {
        throw error;
    }
}

export default potHistoryHandler; 