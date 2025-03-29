import HOUSEHOLD_MODEL from "../../models/Household";
async function getHousehold(id: string) {
  return await HOUSEHOLD_MODEL.findById(id);
}

export default getHousehold;
