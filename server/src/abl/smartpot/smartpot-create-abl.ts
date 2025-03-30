import { FastifyRequest, FastifyReply } from "fastify";
import smartpotCreateDao from "../../dao/smartpot/smart-pot-create-dao";
import { ISmartPot } from "../../models/SmartPot";
import { sendClientError, sendCreated, sendError, sendNotFound } from "../../middleware/response-handler";
import Ajv from "ajv";
import checkFlowerExists from "../../dao/flower/flower-exists-dao";
//import householdDao from "../../dao/household/household-dao";
const schema = {
    type: "object",
    properties: {
        
        serial_number: { type: "string" },
        household_id: { type: "string" },
        active_flower_id: { type: "string" },
    },
    required: [ "serial_number", ],
};
const ajv = new Ajv();
async function createSmartPotHandler(data: ISmartPot, reply: FastifyReply) {
    try {
        const validate = ajv.compile(schema);
        const valid = validate(data);
        if(!valid){
            sendClientError(reply, JSON.stringify(validate.errors?.map(error => error.message)));
            return;
        }
        
       // const doesHouseholdExist = await householdDao.getHousehold(data.household_id.toString());
        const createdSmartPot = await smartpotCreateDao(data);
        sendCreated(reply, createdSmartPot, "SmartPot created successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default createSmartPotHandler;
