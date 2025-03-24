import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import createPot from "../../dao/pot/pot-create-dao";

const SCHEMA = {
    type: "object",
    properties: {
        name: { type: "string" },
        // Add other properties as needed
    },
    required: ["name"],
    additionalProperties: false,
};

const RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        createdPot: { type: "object" }, // Define the structure of createdPot as needed
        message: { type: "string" },
        status: { type: "string" },
    },
};

async function createPotHandler(request: FastifyRequest, reply: FastifyReply) {
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
        const createdPot = await createPot(potData);
        reply.status(201).send({
            createdPot,
            message: "Pot created successfully",
            status: "success",
        });
    } catch (error) {
        if (error instanceof Error) {
            reply.status(500).send({ message: error.message, status: "error" });
        } else {
            reply.status(500).send({ message: "Unknown error occurred", status: "error" });
        }
    }
}

// Add response schema to the handler
createPotHandler.schema = {
    response: {
        201: RESPONSE_SCHEMA,
    },
};

export default createPotHandler;
