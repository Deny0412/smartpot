import potDao from "../../dao/pot/pot-dao"; // Adjust the import based on your DAO structure
import { IPot } from "@/models/Pot";
import createPotHandler from "./pot-create-abl";
import listPotsHandler from "./pot-list-abl";
import getPotHandler from "./pot-get-abl";
import { FastifyRequest, FastifyReply } from "fastify";
import Ajv from "ajv";
import { sendClientError } from "../../middleware/response-handler";

// TODO: validace pomocí ajv
const ajv = new Ajv();

const SCHEMA_POT = {
  type: "object",
  properties: {
    id_profile: { type: "string" },
    name: { type: "string" },
  },
};

class PotAbl {
  static async create(data: IPot, reply: FastifyReply) {
    try {
      const valid = ajv.validate(SCHEMA_POT, data);
      if (!valid) {
        sendClientError(reply, "Invalid pot data", 400);
      }
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

  static async get(id: string, reply: FastifyReply) {
    try {
      return await getPotHandler(id, reply);
    } catch (error: unknown) {
      throw error;
    }
  }
}

export default PotAbl;
