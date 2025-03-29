import HOUSEHOLD_MODEL from "../../models/Household";
import { IHousehold } from "../../models/Household";

async function updateHousehold(id: string, data: IHousehold) {
  return await HOUSEHOLD_MODEL.findByIdAndUpdate(id, data, {
    new: true,
  });
}
export default updateHousehold;
