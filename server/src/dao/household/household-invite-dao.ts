import { Types } from 'mongoose'
import HOUSEHOLD_MODEL from '../../models/Household'

async function householdInviteDao(id: string, invitedUser_id: string) {
  console.log('Inviting user to household:', { id, invitedUser_id })

  const invitedUserObjectId = new Types.ObjectId(invitedUser_id)
  console.log('Created ObjectId:', invitedUserObjectId)

  const result = await HOUSEHOLD_MODEL.findByIdAndUpdate(
    id,
    { $addToSet: { invites: invitedUserObjectId } },
    { new: true }
  )

  console.log('Update result:', result)
  return result
}

export default householdInviteDao
