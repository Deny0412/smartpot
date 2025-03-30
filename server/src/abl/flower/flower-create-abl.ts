import { FastifyRequest, FastifyReply } from "fastify";
import { IFlower } from "../../models/Flower";
import {
  sendClientError,
  sendCreated,
  sendError,
} from "../../middleware/response-handler";
import flowerCreateDao from "../../dao/flower/flower-create-dao";
import householdGetDao from "../../dao/household/household-get-dao";
import Ajv from "ajv";
import checkSmartPotExists from "../../dao/smartpot/smart-pot-exists-dao";
import flowerProfileGetDao from "../../dao/flower-profile/flowerProfile-get-dao";
import { MongoValidator } from "../../validation/mongo-validator";
const schema = {
  type: "object",
  properties: {
    household_id: { type: "string" },
    profile_id: { type: "string" },
    name: { type: "string" },
    serial_number: { type: "string" },
  },
  required: ["household_id", "profile_id", "name", "serial_number"],
};
const ajv = new Ajv();
async function createFlowerHandler(data: IFlower, reply: FastifyReply) {
    console.log(data);
  try {
      const validateIdProfile=await MongoValidator.validateId(data.profile_id.toString());
      if(!validateIdProfile){
          sendClientError(reply, "Invalid profile id");
          return;
      }
      const validateIdHousehold=MongoValidator.validateId(data.household_id.toString());
      if(!validateIdHousehold){
          sendClientError(reply, "Invalid household id");
          return;
      }
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
      return;
    }
    const doesFlowerProfileExist = await flowerProfileGetDao(
      data.profile_id.toString()
    );
    if(!doesFlowerProfileExist){
        sendClientError(reply, "Flower profile does not exist");
        return;
    }
    const doesHouseholdExist = await householdGetDao(
      data.household_id.toString()
    );
    const doesSmartPotExist = await checkSmartPotExists(
      data.serial_number.toString()
    );
    if(!doesSmartPotExist){
        sendClientError(reply, "Smart pot does not exist");
        return;
    }
    //TODO

    
    const createdFlower = await flowerCreateDao(data);
    sendCreated(reply, createdFlower, "Flower created successfully");
  } catch (error) {
    console.error("Error creating flower:", error);
    sendError(reply, error as Error);
  }
}

export default createFlowerHandler;
