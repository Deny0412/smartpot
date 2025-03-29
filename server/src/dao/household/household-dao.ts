import { IHousehold } from "../../models/Household";
import createHouseholdDao from "./household-create-dao";
import deleteHouseholdDao from "./household-delete-dao";
import getHouseholdDao from "./household-get-dao";
import listHouseholdDao from "./household-list-dao";
import updateHouseholdDao from "./household-update-dao";
import { FastifyReply } from "fastify";

async function createHousehold(data: IHousehold, reply: FastifyReply) {
  return await createHouseholdDao(data, reply);
}

async function getHousehold(id: string, reply: FastifyReply) {
  return await getHouseholdDao(id, reply);
}

async function listHousehold(user_id: string, reply: FastifyReply) {
  return await listHouseholdDao(user_id, reply);
}

async function updateHousehold(
  id: string,
  data: IHousehold,
  reply: FastifyReply
) {
  return await updateHouseholdDao(id, data, reply);
}

async function deleteHousehold(id: string, reply: FastifyReply) {
  return await deleteHouseholdDao(id, reply);
}

export default {
  createHousehold,
  getHousehold,
  listHousehold,
  updateHousehold,
  deleteHousehold,
};
