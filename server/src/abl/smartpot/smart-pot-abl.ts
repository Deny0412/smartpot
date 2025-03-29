import smartpotDao from "../../dao/smartpot/smart-pot-create-dao"; // Adjust the import based on your DAO structure
import { ISmartPot } from "@/models/SmartPot";
import createSmartPotHandler from "./smartpot-create-abl";
import { FastifyRequest, FastifyReply } from "fastify";
import Ajv from "ajv";
import { sendClientError, sendError } from "../../middleware/response-handler";
import { IMeasurement } from "@/models/Measurement";
import getSmartPotHandler from "./smartpot-get-abl";


// TODO: validace pomocí ajv


class SmartPotAbl {
    static async create(data: ISmartPot, reply: FastifyReply) {
        try {
            
            return await createSmartPotHandler(data, reply); // Call the handler to create the smartpot
        } catch (error: unknown) {
          throw error;
        }
    }

    static async get(id: string, reply: FastifyReply) {
        try {
            return await getSmartPotHandler(id, reply); // Call the handler to get the smartpot
        } catch (error: unknown) {
            throw error;
        }
    }
}

export default SmartPotAbl;