import USER_MODEL, { IUser } from '../../models/User'

async function searchUsers(query: string): Promise<IUser[]> {
  return USER_MODEL.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { surname: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
  })
    .select('name surname email _id')
    .limit(10)
    .exec()
}

export default searchUsers
