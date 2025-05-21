import SmartPotModel from "../../models/SmartPot";

async function listByHouseholdDao(householdId: string) {
  return await SmartPotModel.find({ household_id: householdId });
}

export default listByHouseholdDao;
