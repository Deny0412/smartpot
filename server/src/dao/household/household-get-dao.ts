import HOUSEHOLD_MODEL from "../../models/Household";
async function getHouseholdDao(id: string) {
  return await HOUSEHOLD_MODEL.findById(id);
}

export default getHouseholdDao;
