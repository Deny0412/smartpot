import { FastifyReply } from 'fastify'
import searchUsers from '../../dao/user/user-search-dao'
import { sendClientError, sendSuccess } from '../../middleware/response-handler'

async function searchUsersHandler(query: string, reply: FastifyReply) {
  try {
    if (!query || query.length < 2) {
      return sendSuccess(reply, [], 'Vyhľadávanie vyžaduje aspoň 2 znaky')
    }

    const users = await searchUsers(query)

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
    console.error('Error in user search:', error)
    sendClientError(reply, 'Chyba pri vyhľadávaní používateľov')
  }
}

export default searchUsersHandler
