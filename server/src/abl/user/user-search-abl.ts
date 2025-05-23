import Ajv from 'ajv'
import { FastifyReply } from 'fastify'
import userSearchDao from '../../dao/user/user-search-dao'
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'
const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
  },
  required: ['query'],
  additionalProperties: false,
}

async function userSearchAbl(query: string, reply: FastifyReply) {
  try {
    const validate = ajv.compile(schema)
    const valid = validate({ query })
    if (!valid) {
      sendClientError(reply, JSON.stringify(validate.errors?.map((error) => error.message)))
      return
    }
    const users = await userSearchDao(query)
    if (!users) {
      sendNotFound(reply, 'No users found')
    }
    sendSuccess(reply, users, 'Users retrieved successfully')
  } catch (error) {
    sendError(reply, error)
  }
}
export default userSearchAbl
