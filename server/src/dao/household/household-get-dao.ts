import HOUSEHOLD_MODEL from "../../models/Household";

async function getHousehold(id: string) {
  try {
    return await HOUSEHOLD_MODEL.findById(id);
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

export default getHousehold;
