import HOUSEHOLD_MODEL from "../../models/Household";

async function listHouseholdDao(user_id: string) {
  return await HOUSEHOLD_MODEL.find({
    $or: [{ owner: user_id }, { members: user_id }],
  });
}
export default listHouseholdDao;
