import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { sendSuccess, sendError, sendNotFound, sendClientError } from "../../middleware/response-handler";
import mongoose from 'mongoose';

async function getPotHandler(id: string, reply: FastifyReply) {
    try {
        // Validate ObjectId format first
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendClientError(reply, "Invalid pot ID format");
        }

        const pot = await potDao.getPot(id);
        if (!pot) {
            return sendNotFound(reply, "Pot not found");
        }
        return sendSuccess(reply, pot, "Pot retrieved successfully");
    } catch (error) {
        return sendError(reply, error);
    }
}

export default getPotHandler;
