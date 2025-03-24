import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-get-dao"; // Adjust the import based on your DAO structure

async function getPotHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params; // Assuming the ID is passed as a URL parameter
    try {
        const pot = await potDao.getPot(id);
        reply.status(200).send({
            pot,
            message: "Pot retrieved successfully",
            status: "success",
        });
    } catch (error) {
        reply.status(500).send({ message: error.message, status: "error" });
    }
}

export default getPotHandler;
