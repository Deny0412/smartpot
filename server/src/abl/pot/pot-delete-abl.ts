import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { sendClientError, sendError, sendNoContent, sendNotFound } from "../../middleware/response-handler";
import mongoose from 'mongoose';

async function deletePotHandler(id: string, reply: FastifyReply) {
    try {
        // Validate ObjectId format first
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendClientError(reply, "Invalid pot ID format");
        }

        const deletedPot = await potDao.deletePot(id);
        if (!deletedPot) {
            return sendNotFound(reply, "Pot not found");
        }
        return sendNoContent(reply);
    } catch (error) {
        sendError(reply, error);
    }
}

export default deletePotHandler;
