import { Types } from 'mongoose'
import HOUSEHOLD_MODEL from '../../models/Household'

async function householdListDao(user_id: string) {
  const userId = new Types.ObjectId(user_id)

  const households = await HOUSEHOLD_MODEL.find({
    $or: [{ owner: userId }, { members: userId }],
  })
  return households
}

export default householdListDao
