import { FastifyReply } from 'fastify'
import { getHouseholdUsers } from '../../dao/household/household-getUsers-dao'

export const householdGetMembersAbl = async (householdId: string, reply: FastifyReply) => {
  try {
    await getHouseholdUsers(householdId, reply)
  } catch (error) {
    
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

export default householdGetMembersAbl
