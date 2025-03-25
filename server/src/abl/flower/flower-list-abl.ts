import { FastifyRequest, FastifyReply } from "fastify";
import flowerDao from "../../dao/flower/flower-dao"; 
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
    household_id: string;
}

async function listFlowersHandler(request: FastifyRequest, reply: FastifyReply) {
    const page = (request.query as QueryParams).page;
    const household_id = (request.query as QueryParams).household_id;
    const limit = (request.query as QueryParams).limit;

    try {
        const flowers = await flowerDao.listFlowers(page, household_id,Number(limit));
        sendSuccess(reply, flowers, "Flowers listed successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default listFlowersHandler;
