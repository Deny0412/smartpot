import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";

async function updateHousehold(id: string, data: IHousehold) {
  if (!id) {
    throw { code: "missingHouseholdId", message: "Household ID is required" };
  }
  try {
    return await HOUSEHOLD_MODEL.findByIdAndUpdate(id, data, {
      new: true,
    });
  } catch (error) {
    throw {
      code: "failedToUpdateHousehold",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
export default updateHousehold;
