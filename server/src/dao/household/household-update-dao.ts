import householdDAO from "./household-dao";
import { IHousehold } from "../../models/Household";

export async function updateHousehold(id: string, data: IHousehold) {
  if (!id) {
    throw { code: "missingHouseholdId", message: "Household ID is required" };
  }

  try {
    return await householdDAO.update(id, data);
  } catch (error) {
    throw {
      code: "failedToUpdateHousehold",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
