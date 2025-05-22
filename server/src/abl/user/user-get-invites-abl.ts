import { FastifyReply } from 'fastify'
import { Types } from 'mongoose'
import getInvites from '../../dao/user/user-get-invites-dao'
import { sendClientError, sendSuccess } from '../../middleware/response-handler'

interface PopulatedHousehold {
  _id: Types.ObjectId
  name: string
  owner: {
    name: string
    surname: string
  }
  updatedAt: Date
}

async function getInvitesHandler(userId: string, reply: FastifyReply) {
  try {
    console.log('ABL: Starting getInvitesHandler for userId:', userId)

    if (!userId) {
      console.error('ABL: Missing userId in getInvitesHandler')
      return sendClientError(reply, 'Chýba ID používateľa')
    }

    console.log('ABL: Fetching invites for userId:', userId)
    const households = await getInvites(userId)
    console.log('ABL: Fetched households:', JSON.stringify(households, null, 2))

    if (!households || !Array.isArray(households)) {
      console.error('ABL: Invalid households data:', households)
      return sendClientError(reply, 'Nepodarilo sa načítať pozvánky')
    }

    const invites = households
      .map((household: PopulatedHousehold) => {
        try {
          if (!household.owner || !household.owner.name || !household.owner.surname) {
            console.error('ABL: Invalid household owner data:', household)
            return null
          }

          return {
            id: household._id.toString(),
            household_name: household.name,
            inviter_name: `${household.owner.name} ${household.owner.surname}`,
            timestamp: household.updatedAt,
            status: 'pending',
          }
        } catch (error) {
          console.error('ABL: Error processing household:', error, household)
          return null
        }
      })
      .filter(Boolean)

    console.log('ABL: Processed invites:', JSON.stringify(invites, null, 2))
    return sendSuccess(reply, invites, 'Pozvánky úspešne načítané')
  } catch (error) {
    console.error('ABL: Error in getInvitesHandler:', error)
    return sendClientError(reply, 'Chyba pri načítaní pozvánok')
  }
}

export default getInvitesHandler
