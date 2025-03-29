import { IHousehold } from "../../models/Household";
import createHouseholdAbl from "./household-create-abl";
import updateHouseholdAbl from "./household-update-abl";
import getHouseholdAbl from "./household-get-abl";
import deleteHouseholdAbl from "./household-delete-abl";
import listHouseholdAbl from "./household-list-abl";

import { FastifyRequest, FastifyReply } from "fastify";

async function createHousehold(data: IHousehold, reply: FastifyReply) {
  return await createHouseholdAbl(data, reply);
}

async function updateHousehold(data: IHousehold, reply: FastifyReply) {
  return await updateHouseholdAbl(data, reply);
}

async function deleteHousehold(id: string, reply: FastifyReply) {
  return await deleteHouseholdAbl(id, reply);
}
async function getHousehold(id: string, reply: FastifyReply) {
  return await getHouseholdAbl(id, reply);
}
async function listHousehold(user_id: string, reply: FastifyReply) {
  return await listHouseholdAbl(user_id, reply);
}

export default {
  createHousehold,
  updateHousehold,
  deleteHousehold,
  getHousehold,
  listHousehold,
};
