import { Types } from 'mongoose'
import FlowerModel from '../../models/Flower'

async function listFlowers(page: number = 1, household_id: string, limit: number = 10) {
  // Ensure page and limit are numbers
  const parsedPage = Math.max(1, Number(page))
  const parsedLimit = Math.max(1, Math.min(100, Number(limit))) // Cap limit at 100

  console.log('Searching flowers with params:', {
    page: parsedPage,
    household_id,
    limit: parsedLimit,
  })

  const query = {
    household_id: new Types.ObjectId(household_id),
  }

  console.log('Query:', query)

  const [flowers, total] = await Promise.all([
    FlowerModel.find(query)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .lean(), // Convert to plain objects
    FlowerModel.countDocuments(query),
  ])

  // Transform _id to id
  const transformedFlowers = flowers.map((flower) => ({
    ...flower,
    _id: flower._id.toString(),
    
  }))

  console.log('Found flowers:', transformedFlowers)
  console.log('Total count:', total)

  return {
    itemList: transformedFlowers,
    pageInfo: {
      total,
      page: parsedPage,
      limit: parsedLimit,
    },
  }
}

export default listFlowers
