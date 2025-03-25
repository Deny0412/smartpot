import { FastifyRequest, FastifyReply } from "fastify";
import flowerDao from "../../dao/flower/flower-dao"; // Adjust the import based on your DAO structure
import { sendClientError, sendError, sendNoContent, sendNotFound } from "../../middleware/response-handler";
import { MongoValidator } from "@/utils/mongo-validator";

async function deleteFlowerHandler(id: string, reply: FastifyReply) {
    try {
        // Validate ObjectId format first
        if (!MongoValidator.validateId(id)) {
            return sendClientError(reply, "Invalid flower ID format");
        }

        const deletedFlower = await flowerDao.deleteFlower(id);
        if (!deletedFlower) {
            return sendNotFound(reply, "Flower not found");
        }
        return sendNoContent(reply);
    } catch (error) {
        sendError(reply, error);
    }
}

export default deleteFlowerHandler;
