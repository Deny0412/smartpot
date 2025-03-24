import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-update-dao"; // Adjust the import based on your DAO structure

const SCHEMA = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        // Add other properties as needed
    },
    required: ["id"],
    additionalProperties: false,
};

async function updatePotHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const potData = request.body;
        const valid = ajv.validate(SCHEMA, potData);
        if (!valid) {
            reply.status(400).send({
                code: "dtoInIsNotValid",
                message: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }
        const updatedPot = await potDao.updatePot(potData);
        reply.status(200).send({
            updatedPot,
            message: "Pot updated successfully",
            status: "success",
        });
    } catch (error) {
        reply.status(500).send({ message: error.message, status: "error" });
    }
}

export default updatePotHandler;
