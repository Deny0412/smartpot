import HOUSEHOLD_MODEL from "../../models/Household";

async function deleteHousehold(id: string) {
  try {
    return await HOUSEHOLD_MODEL.findByIdAndDelete(id);
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

export default deleteHousehold;
