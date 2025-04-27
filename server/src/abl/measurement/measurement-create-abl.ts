import { FastifyRequest, FastifyReply } from "fastify";
import createMeasurement from "../../dao/measurement/measurement-create-dao";
import getSmartpot from "../../dao/smartpot/smart-pot-get-by-serial-number";
import getFlower from "../../dao/flower/flower-get-dao";
import { Types } from "mongoose";
import { isValueOutOfRange } from "../../utils/flower/flower-range-util";
import notificationService from "../../services/notification-service";

import {
  sendClientError,
  sendCreated,
  sendError,
} from "../../middleware/response-handler";
import Ajv from "ajv";

const schema = {
  type: "object",
  properties: {
    smartpot_serial: { type: "string" },
    typeOfData: {
      type: "string",
      enum: ["soil", "water", "temperature", "light", "battery"],
    },
    value: {
      anyOf: [{ type: "number" }, { type: "string" }],
    },
  },
  required: ["smartpot_serial", "typeOfData", "value"],
};

const ajv = new Ajv();

async function createMeasurementHandler(
  data: Object,
  reply: FastifyReply,
  user: any
) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }

    const smartpot = await getSmartpot(data.smartpot_serial as string);
    if (!smartpot) {
      sendClientError(reply, "Smart pot does not exist");
    }

    const activeFlowerId = smartpot?.active_flower_id;
    if (!activeFlowerId) {
      sendClientError(reply, "Smart pot does not have active flower");
    }

    const flower = await getFlower(String(activeFlowerId));

    if (data.typeOfData === "water") {
      if (typeof data.value !== "string") {
        return sendClientError(
          reply,
          `value must be a string for typeOfData water`
        );
      }
      data.value = (data.value as string).toLowerCase();
    } else {
      if (typeof data.value !== "number") {
        return sendClientError(
          reply,
          `value must be a number for typeOfData ${data.typeOfData}`
        );
      }
    }

    // Check if the value is out of range
    const rangeCheckResult = isValueOutOfRange(
      data.typeOfData as string,
      data.value as number,
      flower?.profile
    );

    if (rangeCheckResult && rangeCheckResult.outOfRange) {
      notificationService.sendEmailNotification(
        user.user.email, //ZDE ZADAT EMAIL NA UKAZKU
        rangeCheckResult.message
      );
      notificationService.sendDiscordNotification(rangeCheckResult.message);
      console.log(`Sending notification: ${rangeCheckResult.message}`);
    }

    // Save the measurement data
    data.flower_id = new Types.ObjectId(String(activeFlowerId));
    const createdMeasurement = await createMeasurement(data);

    sendCreated(reply, createdMeasurement, "Measurement created successfully");
  } catch (error) {
    sendError(reply, error);
  }
}

export default createMeasurementHandler;
