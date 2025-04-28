import { FastifyReply } from 'fastify'
import { getHouseholdUsers } from '../../dao/household/household-getUsers-dao'

export const householdGetMembersAbl = async (householdId: string, reply: FastifyReply) => {
  try {
    await getHouseholdUsers(householdId, reply)
  } catch (error) {
    console.error('Chyba v ABL vrstve pre získavanie členov domácnosti:', error)
    return reply.status(500).send({ error: 'Interná chyba servera' })
  }
}

export default householdGetMembersAbl
