import flowerDao from "../../dao/flower/flower-dao"; // Adjust the import based on your DAO structure
import { IFlower } from "@/models/Flower";
import createFlowerHandler from "./flower-create-abl";
import listFlowersHandler from "./flower-list-abl";
import getFlowerHandler from "./flower-get-abl";
import updateFlowerHandler from "./flower-update-abl";
import deleteFlowerHandler from "./flower-delete-abl";
import flowerHistoryHandler from "./flower-history-abl";
import { FastifyRequest, FastifyReply } from "fastify";
import Ajv from "ajv";
import { sendClientError, sendError } from "../../middleware/response-handler";
import { IMeasurement } from "@/models/Measurement";
import flowerAddMeasurementHandler from "./flower-measurent-add-abl";

interface PageInfo {
    page?: number;
    limit?: number;
    // Add other pagination-related fields if needed
}

interface Params {
    id: string; 
}

// TODO: validace pomocí ajv


class FlowerAbl {
    static async create(data: IFlower, reply: FastifyReply) {
        try {
            
            return await createFlowerHandler(data, reply); // Call the handler to create the flower
        } catch (error: unknown) {
          throw error;
        }
    }

    static async update( data: IFlower,reply: FastifyReply) {
        try {
            return await updateFlowerHandler(data, reply);
 
        } catch (error: unknown) {
           throw error;
        }
    }

    static async delete(id: string, reply: FastifyReply) {
        
            return await deleteFlowerHandler(id, reply);
        
    }

    static async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            return await listFlowersHandler(request, reply);
        } catch (error) {
        throw error}
    }

    static async get(request: FastifyRequest, reply: FastifyReply) {
        try{
            const id = (request.params as Params).id; 
            const flower = await getFlowerHandler(id, reply);
            
            return flower;
        }catch(error){
            sendError(reply, error); 
        }
            
    }
    static async history(data: IMeasurement, reply: FastifyReply) {
        try{
            const flower = await flowerHistoryHandler(data, reply);
            
            return flower;
        }catch(error){
            sendError(reply, error); 
        }
            
    }
    static async addMeasurement(data: IMeasurement, reply: FastifyReply) {
        try {
            // Check if the flower exists
            const flowerExists = await flowerDao.getFlower(data.flower_id.toString());
            if (!flowerExists) {
                return sendClientError(reply, "Flower ID does not exist");
            }

            const flower = await flowerAddMeasurementHandler(data, reply);
            return flower;
        } catch (error) {
            sendError(reply, error);
        }
    }
}

export default FlowerAbl;