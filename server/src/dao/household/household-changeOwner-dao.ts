import HOUSEHOLD_MODEL from "../../models/Household";
import householdGetDao from "./household-get-dao";
import { Types } from "mongoose";

async function householdChangeOwnerDao(id: string, newOwner_id: string) {
  const household = await householdGetDao(id);
  const oldOwner_id = household?.owner.toString();
  return await HOUSEHOLD_MODEL.findByIdAndUpdate(
    id,
    {
      $set: { owner: new Types.ObjectId(newOwner_id) },
      $addToSet: { members: new Types.ObjectId(oldOwner_id) },
      $pull: { members: new Types.ObjectId(newOwner_id) },
    },
    { new: true }
  );
}

export default householdChangeOwnerDao;
