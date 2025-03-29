import { FastifyReply } from "fastify";
import { createSchedule, hasActiveSchedule } from "../../dao/schedule/schedule-create-dao";
import { ISchedule } from "../../models/Schedule";
import { sendClientError, sendCreated, sendError } from "../../middleware/response-handler";
import flowerDao from "../../dao/flower/flower-dao";
import { validateCreateSchedule, formatValidationErrors } from "../../validation/schedule-validation";


async function createScheduleHandler(data: ISchedule, reply: FastifyReply) {
    try {
        const valid = validateCreateSchedule(data);
        if (!valid) {
            return sendClientError(reply, formatValidationErrors(validateCreateSchedule.errors));
        }

        const flower = await flowerDao.getFlower(data.flower_id.toString());
        if (!flower) {
            return sendClientError(reply, "Flower not found");
        }

        // If trying to create an active schedule, check if one already exists
        if (data.active) {
            const hasActive = await hasActiveSchedule(data.flower_id.toString());
            if (hasActive) {
                return sendClientError(reply, "This flower already has an active schedule. Please deactivate it first.");
            }
        }

        const createdSchedule = await createSchedule(data);
        return sendCreated(reply, createdSchedule, "Schedule created successfully");
    } catch (error) {
        return sendError(reply, error);
    }
}

export default createScheduleHandler;
