import HOUSEHOLD_MODEL from "../../models/Household";

async function listHousehold(user_id?: string) {
  try {
    if (user_id) {
      return await HOUSEHOLD_MODEL.find({
        $or: [{ owner: user_id }, { members: user_id }],
      });
    }
    return await HOUSEHOLD_MODEL.find();
  } catch (error) {
    if (error instanceof Error) {
      throw { code: "failedToListHouseholds", message: error.message };
    } else {
      throw {
        code: "failedToListHouseholds",
        message: "Unknown error occurred",
      };
    }
  }
}
export default listHousehold;
