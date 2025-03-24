import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import {sendError, sendNoContent} from "../../middleware/response-handler";
async function deletePotHandler(id: string, reply: FastifyReply) {
    try {
        return await potDao.deletePot(id);
    } catch (error) {
        sendError(reply, error);
    }
}

export default deletePotHandler;
