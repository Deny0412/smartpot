import { FastifyRequest, FastifyReply } from "fastify";
import flowerProfileCreateAbl from "../abl/flower-profile/flowerProfile-create-abl";
import flowerProfileDeleteAbl from "../abl/flower-profile/flowerProfile-delete-abl";
import flowerProfileGetAbl from "../abl/flower-profile/flowerProfile-get-abl";
//import flowerProfileListAbl from "../abl/flower-profile/flowerProfile-list-abl";
import flowerProfileUpdateAbl from "../abl/flower-profile/flowerProfile-update-abl";

import { sendInternalServerError } from "../middleware/response-handler";
import { IFlowerProfile } from "../models/FlowerProfile";

interface Params {
  id: string;
}

export const flowerProfileController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reqParam = request.body as IFlowerProfile;
      await flowerProfileCreateAbl(reqParam, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id;
      await flowerProfileDeleteAbl(id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id;
      await flowerProfileGetAbl(id, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedFlowerProfile = request.body as IFlowerProfile;
      await flowerProfileUpdateAbl(updatedFlowerProfile, reply);
    } catch (error) {
      sendInternalServerError(reply);
    }
  },
};
