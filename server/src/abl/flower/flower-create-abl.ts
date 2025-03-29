import { FastifyRequest, FastifyReply } from "fastify";
import flowerDao from "../../dao/flower/flower-dao";
import { IFlower } from "../../models/Flower";
import { sendClientError, sendCreated, sendError } from "../../middleware/response-handler";
import householdGetDao from "../../dao/household/household-get-dao";
import Ajv from "ajv";
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

    
    try {
        const validate = ajv.compile(schema);
        const valid = validate(data);
        if(!valid){
            sendClientError(reply, JSON.stringify(validate.errors?.map(error => error.message)));
            return;
        }
        const doesHouseholdExist = await householdGetDao(data.household_id.toString());
     
        const createdFlower = await flowerDao.createFlower(data);
        sendCreated(reply, createdFlower, "Flower created successfully");
    } catch (error) {
        sendError(reply, error);
    }
}

export default createFlowerHandler;
