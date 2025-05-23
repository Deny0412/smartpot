import HOUSEHOLD_MODEL from "../../models/Household";
import { Types } from "mongoose";

async function getInvitesDao(userId: string) {
  const userObjectId = new Types.ObjectId(userId);

  return await HOUSEHOLD_MODEL.find({
    invites: userObjectId,
  }).lean();
}

export default getInvitesDao;
