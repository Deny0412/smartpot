import { IMeasurement } from "@/models/Measurement";
import {
  sendClientError,
  sendError,
  sendSuccess,
} from "../../middleware/response-handler";
import { FastifyReply } from "fastify";
import getFlower from "../../dao/flower/flower-get-dao";
import addMeasurement from "../../dao/flower/flower-measurement-add";
async function flowerAddMeasurementHandler(
  data: IMeasurement,
  reply: FastifyReply
) {
  try {
    const flowerExists = await getFlower(data.flower_id.toString());
    if (!flowerExists) {
      return sendClientError(reply, "Flower ID does not exist");
    }
    const flower = await addMeasurement(data);
    return sendSuccess(reply, flower, "Measurement added successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default flowerAddMeasurementHandler;
