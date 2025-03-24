import { IHousehold } from "../../models/Household";
import createHouseholdDao from "./household-create-dao";
import deleteHouseholdDao from "./household-delete-dao";
import getHouseholdDao from "./household-get-dao";
//import listHouseholdDao from './household-list-dao';
import updateHouseholdDao from "./household-update-dao";

async function createHousehold(data: IHousehold) {
  return await createHouseholdDao(data);
}

async function getHousehold(id: string) {
  return await getHouseholdDao(id);
}

async function listHousehold() {}

async function updateHousehold(id: string, data: IHousehold) {
  return await updateHouseholdDao(id, data);
}

async function deleteHousehold(id: string) {
  return await deleteHouseholdDao(id);
}

export default {
  createHousehold,
  getHousehold,
  listHousehold,
  updateHousehold,
  deleteHousehold,
};
