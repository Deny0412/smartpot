import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { sendSuccess, sendError } from "../../middleware/response-handler";

async function getPotHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
        const pot = await potDao.getPot(request.params.id);
        if (!pot) {
            return sendError(reply, "Pot not found"); 
        }
        sendSuccess(reply, pot, "Pot retrieved successfully");
    } catch (error) {
        sendError(reply, error); 
    }
}

export default getPotHandler;
