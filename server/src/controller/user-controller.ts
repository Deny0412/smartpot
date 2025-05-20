import { FastifyReply, FastifyRequest } from 'fastify'
import { Types } from 'mongoose'
import { sendError, sendSuccess } from '../middleware/response-handler'
import HOUSEHOLD_MODEL, { IHousehold } from '../models/Household'
import { User } from '../models/User'

interface PopulatedHousehold extends Omit<IHousehold, 'owner'> {
  owner: {
    _id: Types.ObjectId
    name: string
    surname: string
  }
}

export const userController = {
  search: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { query } = request.query as { query: string }

      if (!query || query.length < 2) {
        return sendSuccess(reply, [], 'Vyhľadávanie vyžaduje aspoň 2 znaky')
      }

      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { surname: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
        .select('name surname email _id')
        .limit(10)

      return sendSuccess(
        reply,
        users.map((user) => ({
          id: user._id,
          name: user.name,
          surname: user.surname,
          email: user.email,
        })),
        'Používatelia nájdení'
      )
    } catch (error) {
      sendError(reply, error)
    }
  },

  getInvites: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any).id
      console.log('Searching invites for user:', userId)

      const households = await HOUSEHOLD_MODEL.find({
        invites: userId,
      })
        .populate('owner', 'name surname')
        .lean()

      console.log('Found households with invites:', households)

      const invites = households.map((household) => ({
        id: household._id.toString(),
        household_name: household.name,
        inviter_name: `${household.owner.name} ${household.owner.surname}`,
        timestamp: household.updatedAt,
        status: 'pending',
      }))

      console.log('Processed invites:', invites)

      return sendSuccess(reply, invites, 'Pozvánky úspešne načítané')
    } catch (error) {
      console.error('Error in getInvites:', error)
      sendError(reply, error)
    }
  },
}
