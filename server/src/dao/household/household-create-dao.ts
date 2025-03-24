import householdDAO from "./household-dao";
import { IHousehold } from "../../models/Household";

export async function createHousehold(data: IHousehold) {
  try {
    const household = await householdDAO.create(data);
    return household;
  } catch (error) {
    if (error instanceof Error) {
      throw { code: "failedToCreateHousehold", message: error.message };
    } else {
      throw {
        code: "failedToCreateHousehold",
        message: "Unknown error occurred",
      };
    }
  }
}
