import householdDAO from "./household-dao";

export async function getHousehold(id: string) {
  try {
    const household = await householdDAO.get(id);
    return household;
  } catch (error) {
    if (error instanceof Error) {
      throw { code: "failedToGetHousehold", message: error.message };
    } else {
      throw {
        code: "failedToGetHousehold",
        message: "Unknown error occurred",
      };
    }
  }
}
