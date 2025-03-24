import householdDAO from "./household-dao";

export async function listHousehold(user_id?: string) {
  try {
    const households = user_id
      ? await householdDAO.list(user_id) // Filtered list
      : await householdDAO.list(); // Full list

    return households;
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
