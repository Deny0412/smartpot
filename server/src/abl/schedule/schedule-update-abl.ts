import Ajv from "ajv";
const ajv = new Ajv();
import { FastifyRequest, FastifyReply } from "fastify";
import scheduleUpdateDao from "../../dao/schedule/schedule-update-dao";
import { ISchedule } from "../../models/Schedule";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendClientError,
} from "../../middleware/response-handler";
import { MongoValidator } from "../../validation/mongo-validator";
async function updateScheduleHandler(data: ISchedule, reply: FastifyReply) {
  try {
    const valid = MongoValidator.validateId(data.id);
    if (!valid) {
      return sendClientError(reply, "Invalid schedule ID format");
    }
    const updatedSchedule = await scheduleUpdateDao(String(data.id), data);

    if (!updatedSchedule) {
      return sendNotFound(reply, "Schedule not found");
    }

    return sendSuccess(reply, updatedSchedule, "Schedule updated successfully");
  } catch (error) {
    
    return sendError(reply, "Failed to update schedule");
  }
}

export default updateScheduleHandler;