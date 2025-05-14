import { Types } from 'mongoose'
import HOUSEHOLD_MODEL from '../../models/Household'

export const householdLeaveDao = {
  leave: async (householdId: string, userId: string) => {
    const household = await HOUSEHOLD_MODEL.findById(householdId)
    if (!household) {
      throw new Error('Household not found')
    }

    const userIdObject = new Types.ObjectId(userId)

    // Check if user is a member
    if (!household.members.some((member) => member.equals(userIdObject))) {
      throw new Error('User is not a member of this household')
    }

    // Cannot leave if user is the owner
    if (household.owner.equals(userIdObject)) {
      throw new Error('Owner cannot leave the household')
    }

    // Remove user from members array
    household.members = household.members.filter((member) => !member.equals(userIdObject))
    await household.save()

    return household
  },
}
