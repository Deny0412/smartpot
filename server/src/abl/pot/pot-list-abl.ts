import { FastifyRequest, FastifyReply } from "fastify";
import potDao from "../../dao/pot/pot-dao"; 
import Ajv from "ajv";
import { sendClientError, sendSuccess, sendError } from "../../middleware/response-handler";

const ajv = new Ajv();

const SCHEMA = {
    type: "object",
    properties: {
        page: { type: "number" },
        id_household: { type: "string" },
        limit: { type: "number" },
    },
    required: ["page", "householdId"],
};

interface QueryParams {
    page: number; 
    limit?: number;
    id_household: string;
}

async function listPotsHandler(request: FastifyRequest, reply: FastifyReply) {
    const page = (request.query as QueryParams).page;
    const id_household = (request.query as QueryParams).id_household;
    const limit = (request.query as QueryParams).limit;

    try {
        const pots = await potDao.listPots(page, id_household,Number(limit));
        sendSuccess(reply, pots, "Pots listed successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default listPotsHandler;
