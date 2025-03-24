import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { IPot } from "@/models/Pot";
import createPotHandler from "./pot-create-abl";
import listPotsHandler from "./pot-list-abl";
import { FastifyRequest, FastifyReply } from "fastify";
// Define an interface for the page info
interface PageInfo {
    page?: number;
    limit?: number;
    // Add other pagination-related fields if needed
}

class PotAbl {
    static async create(data: IPot, reply: FastifyReply) {
        try {
            return await createPotHandler(data, reply); // Call the handler to create the pot
        } catch (error: unknown) {
          throw error;
        }
    }

    static async update(id: string, data: IPot) {
        try {
            const updatedPot = await potDao.updatePot(id, data);
            if (!updatedPot) {
                throw new Error("Pot not found");
            }
            return updatedPot; // Return the updated pot
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error("Failed to update pot: " + error.message);
            } else {
                throw new Error("Failed to update pot: Unknown error occurred");
            }
        }
    }

    static async delete(id: string) {
        try {
            await potDao.deletePot(id);
            return null; // Return null to indicate successful deletion
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error("Failed to delete pot: " + error.message);
            } else {
                throw new Error("Failed to delete pot: Unknown error occurred");
            }
        }
    }

    static async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            return await listPotsHandler(request, reply);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error("Failed to list pots: " + error.message);
            } else {
                throw new Error("Failed to list pots: Unknown error occurred");
            }
        }
    }

    static async get(id: string) {
        try {
            const pot = await potDao.getPot(id);
            if (!pot) {
                throw new Error("Pot not found");
            }
            return pot; // Return the found pot
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error("Failed to get pot: " + error.message);
            } else {
                throw new Error("Failed to get pot: Unknown error occurred");
            }
        }
    }
} 

export default PotAbl;