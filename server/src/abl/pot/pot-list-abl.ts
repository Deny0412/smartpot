import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; 
import Ajv from "ajv";
import { sendClientError, sendSuccess, sendError } from "../../middleware/response-handler";

const ajv = new Ajv();

const SCHEMA = {
    type: "object",
    properties: {
        page: { type: "number" },
        householdId: { type: "string" },
    },
    required: ["page", "householdId"],
};

async function listPotsHandler(request: FastifyRequest, reply: FastifyReply) {
    const requestData = {
        page: request.query.page,
        householdId: request.query.householdId,
    };

    const valid = ajv.validate(SCHEMA, requestData);
    if (!valid) {
        return sendClientError(reply, "dtoIn is not valid", 400);
    }

    try {
        const pots = await potDao.listPots(requestData, requestData.householdId);
        sendSuccess(reply, pots, "Pots listed successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default listPotsHandler;
