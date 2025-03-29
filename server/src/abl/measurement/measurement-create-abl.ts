import { FastifyRequest, FastifyReply } from "fastify";
import createMeasurement from "../../dao/measurement/measurement-create-dao";
import { IMeasurement } from "../../models/Measurement";
import { sendClientError, sendCreated, sendError } from "../../middleware/response-handler";
import Ajv from "ajv";

const schema = {
    type: "object",
    properties: {
        flower_id: { type: "string" },
        humidity: { type: ["number", "null"] },
        waterlevel: { type: ["number", "null"] },
        temperature: { type: ["number", "null"] },
        light: { type: ["number", "null"] },
    },
    required: ["flower_id"],
};

const ajv = new Ajv();

async function createMeasurementHandler(data: IMeasurement, reply: FastifyReply) {
    try {
        const validate = ajv.compile(schema);
        const valid = validate(data);
        if (!valid) {
            sendClientError(reply, JSON.stringify(validate.errors?.map(error => error.message)));
            return;
        }

        const createdMeasurement = await createMeasurement(data);
        sendCreated(reply, createdMeasurement, "Measurement created successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default createMeasurementHandler;
