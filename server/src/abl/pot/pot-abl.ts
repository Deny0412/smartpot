import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { IPot } from "@/models/Pot";
import createPotHandler from "./pot-create-abl";
import listPotsHandler from "./pot-list-abl";
import getPotHandler from "./pot-get-abl";
import updatePotHandler from "./pot-update-abl";
import deletePotHandler from "./pot-delete-abl";
import { FastifyRequest, FastifyReply } from "fastify";
import Ajv from "ajv";
import { sendClientError, sendError } from "../../middleware/response-handler";

interface PageInfo {
    page?: number;
    limit?: number;
    // Add other pagination-related fields if needed
}

interface Params {
    id: string; 
}

// TODO: validace pomocí ajv


class PotAbl {
    static async create(data: IPot, reply: FastifyReply) {
        try {
            
            return await createPotHandler(data, reply); // Call the handler to create the pot
        } catch (error: unknown) {
          throw error;
        }
    }

    static async update( data: IPot,reply: FastifyReply) {
        try {
            return await updatePotHandler(data, reply);
 
        } catch (error: unknown) {
           throw error;
        }
    }

    static async delete(id: string, reply: FastifyReply) {
        
            return await deletePotHandler(id, reply);
        
    }

    static async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            return await listPotsHandler(request, reply);
        } catch (error) {
        throw error}
    }

    static async get(request: FastifyRequest, reply: FastifyReply) {
        try{
            const id = (request.params as Params).id; 
            const pot = await getPotHandler(id, reply);
            
            return pot;
        }catch(error){
            sendError(reply, error); 
        }
            
    }
}

export default PotAbl;