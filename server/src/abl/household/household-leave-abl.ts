import { FastifyReply } from 'fastify'
import { householdLeaveDao } from '../../dao/household/household-leave-dao'
import { sendError } from '../../middleware/response-handler'

export default async function householdLeaveAbl(householdId: string, userId: string, reply: FastifyReply) {
  try {
    const household = await householdLeaveDao.leave(householdId, userId)
    return reply.status(200).send({
      message: 'Successfully left the household',
      household,
    })
  } catch (error) {
    sendError(reply, error)
  }
}
