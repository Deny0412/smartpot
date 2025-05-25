import { Types } from 'mongoose'
import HOUSEHOLD_MODEL from '../../models/Household'

interface PopulatedHousehold {
  _id: Types.ObjectId
  name: string
  owner: {
    _id: Types.ObjectId
    name: string
    surname: string
  }
  updatedAt: Date
}

async function getInvites(userId: string): Promise<PopulatedHousehold[]> {
  try {
    console.log('DAO: Finding households with invite for userId:', userId)

    if (!userId) {
      console.error('DAO: Missing userId in getInvites')
      throw new Error('Missing userId')
    }

    const query = { invites: userId }
    console.log('DAO: Query:', JSON.stringify(query, null, 2))

    const households = await HOUSEHOLD_MODEL.find(query)
      .populate({
        path: 'owner',
        select: 'name surname',
        model: 'User',
      })
      .lean()
      .exec()

    console.log('DAO: Found households:', JSON.stringify(households, null, 2))

    if (!households) {
      console.log('DAO: No households found')
      return []
    }

    return households as PopulatedHousehold[]
  } catch (error) {
    console.error('DAO: Error in getInvites:', error)
    throw error
  }
}

export default getInvites
