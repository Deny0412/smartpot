import { User } from '../../models/User'

async function getUser(id: string) {
  const user = await User.findById(id)
  return user
}

export default getUser
