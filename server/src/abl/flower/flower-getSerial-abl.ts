import { FastifyReply } from "fastify";

import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../../middleware/response-handler";
import getSerialFlower from "../../dao/flower/flower-getSerial-dao";

async function getSerialFlowerAbl(serial_number: string, reply: FastifyReply) {
  try {
    const flower = await getSerialFlower(serial_number);
    if (!flower) {
      return sendNotFound(reply, "Flower not found");
    }
    return sendSuccess(reply, flower, "Flower retrieved successfully");
  } catch (error) {
    return sendError(reply, error);
  }
}

export default getSerialFlowerAbl;
