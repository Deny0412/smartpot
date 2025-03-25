import { FastifyRequest, FastifyReply } from "fastify";
import flowerDao from "../../dao/flower/flower-dao";
import { IFlower } from "../../models/Flower";
import { sendCreated, sendError } from "../../middleware/response-handler";

async function createFlowerHandler(data: IFlower, reply: FastifyReply) {
    try {
        const createdFlower = await flowerDao.createFlower(data);
        sendCreated(reply, createdFlower, "Flower created successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default createFlowerHandler;
