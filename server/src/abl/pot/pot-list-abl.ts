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


interface QueryParams {
    page?: number; 
    limit?: number; 
    householdId?: string;
}

async function listPotsHandler(request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) {
    const requestData = {
        page: request.query.page,
        householdId: request.query.householdId,
    };

    /*const valid = ajv.validate(SCHEMA, requestData);
    if (!valid) {
        return sendClientError(reply, "dtoIn is not valid", 400);
    }*/

    try {
        const { page, householdId } = requestData; 

        // Ensure householdId is defined before passing it to the DAO
        if (!householdId) {
            return sendClientError(reply, "householdId is required", 400);
        }

        const pots = await potDao.listPots(page, householdId); 
        sendSuccess(reply, pots, "Pots listed successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default listPotsHandler;
