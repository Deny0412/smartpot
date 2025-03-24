import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao";
import { IPot } from "../../models/Pot";
import { sendCreated, sendError } from "../../middleware/response-handler";

async function createPotHandler(data: IPot, reply: FastifyReply) {
    try {
        const createdPot = await potDao.createPot(data);
        sendCreated(reply, createdPot, "Pot created successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default createPotHandler;
