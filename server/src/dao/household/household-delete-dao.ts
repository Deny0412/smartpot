import householdDAO from "./household-dao";

export async function deleteHousehold(id: string) {
  try {
    await householdDAO.delete(id);
    return;
  } catch (error) {
    if (error instanceof Error) {
      throw { code: "failedToDeleteHousehold", message: error.message };
    } else {
      throw {
        code: "failedToDeleteHousehold",
        message: "Unknown error occurred",
      };
    }
  }
}
