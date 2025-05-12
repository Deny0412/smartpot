import { FastifyReply } from 'fastify'
import HOUSEHOLD_MODEL from '../../models/Household'
import { User } from '../../models/User'

export const getHouseholdUsers = async (householdId: string, reply: FastifyReply) => {
  try {
    const household = await HOUSEHOLD_MODEL.findById(householdId)
    if (!household) {
      return reply.status(404).send({ error: 'Domácnosť nebola nájdená' })
    }

    // Načítame všetkých používateľov (členov aj pozvaných)
    const allUserIds = [...household.members, ...household.invites]
    const users = await User.find({ _id: { $in: allUserIds } })

    // Transformujeme údaje do formátu { userId: userData }
    const usersMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = {
        ...user.toObject(),
        role: user._id.equals(household.owner) ? 'owner' : 'member',
      }
      return acc
    }, {} as { [key: string]: any })

    return reply.status(200).send(usersMap)
  } catch (error) {
    console.error('Chyba pri získavaní členov domácnosti:', error)
    return reply.status(500).send({ error: 'Interná chyba servera' })
  }
}
