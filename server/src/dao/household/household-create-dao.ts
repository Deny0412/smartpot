import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";

async function createHousehold(data: IHousehold) {
  try {
    return await HOUSEHOLD_MODEL.create(data);
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
export default createHousehold;
