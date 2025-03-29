import { FastifyRequest, FastifyReply } from "fastify";
import flowerDao from "../../dao/flower/flower-dao"; // Adjust the import based on your DAO structure
import { sendSuccess, sendError, sendNotFound, sendClientError } from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";

async function getFlowerHandler(id: string, reply: FastifyReply) {
    try {
        if(!MongoValidator.validateId(id)){
            return sendClientError(reply, "Invalid flower ID format");
        }

        const flower = await flowerDao.getFlower(id);
        if (!flower) {
            return sendNotFound(reply, "Flower not found");
        }
        return sendSuccess(reply, flower, "Flower retrieved successfully");
    } catch (error) {
        return sendError(reply, error);
    }
}

export default getFlowerHandler;
