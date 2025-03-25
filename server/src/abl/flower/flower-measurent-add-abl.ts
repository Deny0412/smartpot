import { IMeasurement } from "@/models/Measurement";
import { sendClientError, sendError, sendSuccess } from "../../middleware/response-handler";
import potDao from "../../dao/pot/pot-dao";
import { FastifyReply } from "fastify";

async function potAddMeasurementHandler(data: IMeasurement, reply: FastifyReply) {
    try{
        const pot = await potDao.addMeasurement(data);
        return sendSuccess(reply, pot, "Measurement added successfully");
    }catch(error){
        return sendError(reply, error);
    }
}

export default potAddMeasurementHandler;
