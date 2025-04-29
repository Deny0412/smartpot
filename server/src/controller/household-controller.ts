import { FastifyReply, FastifyRequest } from 'fastify'
import householdChangeOwnerAbl from '../abl/household/household-changeOwner-abl'
import householdDecisionAbl from '../abl/household/household-decision-abl'
import householdDeleteAbl from '../abl/household/household-delete-abl'
import householdGetAbl from '../abl/household/household-get-abl'
import householdGetMembersAbl from '../abl/household/household-getMembers-abl'
import householdInviteAbl from '../abl/household/household-invite-abl'
import householdKickAbl from '../abl/household/household-kick-abl'
import householdLeaveAbl from '../abl/household/household-leave-abl'
import householdListAbl from '../abl/household/household-list-abl'
import householdUpdateAbl from '../abl/household/household-update-abl'
import { sendError } from '../middleware/response-handler'
import HOUSEHOLD_MODEL, { IHousehold } from '../models/Household'
import { User } from '../models/User'

interface Params {
  id: string
  user_id?: string
  invited_user_id?: string
  kicked_user_id?: string
  new_owner_id?: string
}

export const householdController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name } = request.body as { name: string }
      const userId = (request.user as any).id

      const user = await User.findById(userId)
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      const household = new HOUSEHOLD_MODEL({
        name,
        owner: userId,
        members: [userId],
        invites: [],
      })

      await household.save()

      return reply.status(201).send({
        message: 'Household created successfully',
        household,
      })
    } catch (error) {
      console.error('Error creating household:', error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.body as Params).id
      await householdDeleteAbl(id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  get: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      await householdGetAbl(id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user_id = (request.user as { id: string })?.id
      if (!user_id) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
      await householdListAbl(user_id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as IHousehold
      await householdUpdateAbl(updatedHousehold, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  invite: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const invite = request.body as Params
      await householdInviteAbl(invite, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  kick: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const kick = request.body as Params
      await householdKickAbl(kick, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  changeOwner: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const newOwner = request.body as Params
      await householdChangeOwnerAbl(newOwner, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  decision: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updatedHousehold = request.body as Params
      const user_id = (request.user as { user?: { id?: string } })?.user?.id as string

      await householdDecisionAbl(updatedHousehold, user_id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  getMembers: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const id = (request.params as Params).id
      await householdGetMembersAbl(id, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
  leave: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const householdId = (request.body as Params).id
      const userId = (request.user as { id: string })?.id
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
      await householdLeaveAbl(householdId, userId, reply)
    } catch (error) {
      sendError(reply, error)
    }
  },
}
