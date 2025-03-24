import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-delete-dao"; // Adjust the import based on your DAO structure

async function deletePotHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params; // Assuming the ID is passed as a URL parameter
    try {
        await potDao.deletePot(id);
        reply.status(200).send({ message: "Pot deleted successfully", status: "success" });
    } catch (error) {
        reply.status(500).send({ message: error.message, status: "error" });
    }
}

export default deletePotHandler;
