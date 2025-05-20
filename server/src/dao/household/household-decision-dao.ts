import { Types } from 'mongoose'
import HOUSEHOLD_MODEL from '../../models/Household'

async function householdDecisionDao(id: string, invitedUser_id: string, decision: boolean) {
  console.log('Processing decision for household:', { id, invitedUser_id, decision })

  const invitedUserObjectId = new Types.ObjectId(invitedUser_id)
  console.log('Created ObjectId:', invitedUserObjectId)

  const update = decision
    ? {
        $addToSet: { members: invitedUserObjectId },
        $pull: { invites: invitedUserObjectId },
      }
    : { $pull: { invites: invitedUserObjectId } }

  console.log('Update operation:', update)

  const result = await HOUSEHOLD_MODEL.findByIdAndUpdate(id, update, { new: true })
  console.log('Update result:', result)
  return result
}

export default householdDecisionDao
