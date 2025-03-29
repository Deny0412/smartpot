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
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      sendClientError(
        reply,
        JSON.stringify(validate.errors?.map((error) => error.message))
      );
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
    sendError(reply, error);
  }
}

export default createFlowerHandler;
