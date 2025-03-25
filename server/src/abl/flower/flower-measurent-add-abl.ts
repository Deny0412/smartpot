import { IMeasurement } from "@/models/Measurement";
import { sendClientError, sendError, sendSuccess } from "../../middleware/response-handler";
import flowerDao from "../../dao/flower/flower-dao";
import { FastifyReply } from "fastify";

async function flowerAddMeasurementHandler(data: IMeasurement, reply: FastifyReply) {
    try{
        const flower = await flowerDao.addMeasurement(data);
        return sendSuccess(reply, flower, "Measurement added successfully");
    }catch(error){
        return sendError(reply, error);
    }
}

export default flowerAddMeasurementHandler;
