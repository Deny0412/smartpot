import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { IPot } from "../../models/Pot";
import { sendCreated, sendError } from "../../middleware/response-handler"; // Import sendError for consistent error handling

const SCHEMA = {
    type: "object",
    properties: {
        _id: { type: "string" },
        id_profile: { type: "string" },
        name: { type: "string" },
        // Add other properties as needed
    },
    required: ["_id"],
    additionalProperties: false,
};

async function updatePotHandler(data: IPot, reply: FastifyReply) {
    try {
        const updatedPot = await potDao.updatePot(String(data._id),data);
        sendCreated(reply, updatedPot, "Pot updated successfully");
    } catch (error) {
        // Use sendError for unexpected errors
        sendError(reply, error);
    }
}

export default updatePotHandler;
