import { Types } from 'mongoose'
import HOUSEHOLD_MODEL from '../../models/Household'
import USER_MODEL from '../../models/User'

async function getUsersByHousehold(householdId: string) {
  const household = await HOUSEHOLD_MODEL.findById(householdId)
  if (!household) return null
  const userIds = [...household.members.map((id) => id.toString()), household.owner.toString()]

  const uniqueUserIds = Array.from(new Set(userIds)).map((id) => new Types.ObjectId(id))

  const invitedUserIds = [...household.invites.map((id) => id.toString())]

  const uniqueInvitedUserIds = Array.from(new Set(invitedUserIds)).map((id) => new Types.ObjectId(id))

  const users = await USER_MODEL.find({ _id: { $in: uniqueUserIds } }).select('email name surname')

  const invitedUsers = await USER_MODEL.find({
    _id: { $in: uniqueInvitedUserIds },
  }).select('email name surname')

  return {
    members: users,
    invitedMembers: invitedUsers,
  }
}

export default getUsersByHousehold
