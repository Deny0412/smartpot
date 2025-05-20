import { FastifyReply, FastifyRequest } from 'fastify'
import { Types } from 'mongoose'
import { getFlower } from '../dao/flower/flower-get-dao'
import householdGetDao from '../dao/household/household-get-dao'
import smartpotGetDao from '../dao/smartpot/smart-pot-get-dao'
import { IHousehold } from '../models/Household'

function isOwner(household: IHousehold, userId: string) {
  return household.owner.equals(new Types.ObjectId(userId))
}

function isMember(household: IHousehold, userId: string) {
  return household.members.some((member) => member.equals(new Types.ObjectId(userId)))
}

// Define a type for the user object
interface IUser {
  id: string
}

export function householdAuthMidlleware(authorizedRole: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (authorizedRole.length === 0) {
      return reply.code(500).send({ error: 'No authorized roles provided' })
    }

    // Použití request.routeOptions.url místo zastaralého request.routerPath
    const isHouseholdRoute: boolean = request.routeOptions?.url?.includes('household') ?? false
    const isFlowerRoute: boolean = request.routeOptions?.url?.includes('flower') ?? false
    const isMeasurementRoute: boolean = request.routeOptions?.url?.includes('measurements') ?? false
    const isSmartPotRoute: boolean = request.routeOptions?.url?.includes('smart-pot') ?? false

    // Detekcia typov transplantácií
    const isTransplantToSmartPot: boolean = request.routeOptions?.url?.includes('transplant-to-smartpot') ?? false
    const isTransplantWithSmartPot: boolean = request.routeOptions?.url?.includes('transplant-with-smartpot') ?? false
    const isTransplantWithoutSmartPot: boolean =
      request.routeOptions?.url?.includes('transplant-without-smartpot') ?? false
    const isTransplantToFlower: boolean = request.routeOptions?.url?.includes('transplant-to-flower') ?? false
    const isTransplantWithFlower: boolean = request.routeOptions?.url?.includes('transplant-with-flower') ?? false
    const isTransplantWithoutFlower: boolean = request.routeOptions?.url?.includes('transplant-without-flower') ?? false

    console.log('Middleware - Route info:', {
      url: request.routeOptions?.url,
      isHouseholdRoute,
      isFlowerRoute,
      isMeasurementRoute,
      isSmartPotRoute,
      isTransplantToSmartPot,
      isTransplantWithSmartPot,
      isTransplantWithoutSmartPot,
      isTransplantToFlower,
      isTransplantWithFlower,
      isTransplantWithoutFlower,
    })

    const householdIdKey: 'id' | 'household_id' = isHouseholdRoute ? 'id' : 'household_id'

    const requestData = request as {
      query?: Record<string, string | undefined>
      params?: Record<string, string | undefined>
      body?: Record<string, any>
    }

    let householdId: string | undefined
    let flowerId: string | undefined
    let smartPotId: string | undefined

    // Získanie ID z requestu podľa typu endpointu
    if (isFlowerRoute || isMeasurementRoute) {
      flowerId = requestData.query?.id || requestData.params?.id || requestData.body?.id
      householdId =
        requestData.query?.[householdIdKey] ||
        requestData.params?.[householdIdKey] ||
        requestData.body?.[householdIdKey]

      console.log('Flower/Measurement route - flowerId:', flowerId)
      console.log('Flower/Measurement route - householdId:', householdId)
    } else if (isSmartPotRoute) {
      smartPotId = requestData.query?.id || requestData.params?.id || requestData.body?.id
      householdId =
        requestData.query?.[householdIdKey] ||
        requestData.params?.[householdIdKey] ||
        requestData.body?.[householdIdKey]

      console.log('SmartPot route - smartPotId:', smartPotId)
      console.log('SmartPot route - householdId:', householdId)
    } else {
      householdId =
        requestData.query?.[householdIdKey] ||
        requestData.params?.[householdIdKey] ||
        requestData.body?.[householdIdKey]
    }

    // Speciálna logika pre transplantácie
    if (isTransplantToSmartPot || isTransplantWithSmartPot || isTransplantWithoutSmartPot) {
      flowerId = requestData.body?.flowerId
      console.log('Flower transplant - flowerId:', flowerId)
    }

    if (isTransplantToFlower || isTransplantWithFlower || isTransplantWithoutFlower) {
      smartPotId = requestData.body?.smartPotId
      console.log('SmartPot transplant - smartPotId:', smartPotId)
    }

    // Ak máme smartPotId, skúsime získať householdId z neho
    if (!householdId && smartPotId) {
      try {
        console.log('Fetching smart pot data for ID:', smartPotId)
        const smartPot = await smartpotGetDao.getSmartPot(smartPotId)
        if (!smartPot || !smartPot.household_id) {
          console.error('Smart pot not found or missing household_id:', { smartPotId, smartPot })
          return reply.code(404).send({ error: `Smart pot with ID ${smartPotId} not found or missing household_id` })
        }
        householdId = smartPot.household_id.toString()
        console.log('Found household_id from smart pot:', householdId)
      } catch (error) {
        console.error('Error fetching smart pot:', error)
        return reply.code(500).send({ error: 'Error fetching smart pot data' })
      }
    }

    // Ak máme flowerId, skúsime získať householdId z neho
    if (!householdId && flowerId) {
      try {
        console.log('Fetching flower data for ID:', flowerId)
        const flower = await getFlower(flowerId as string)
        if (!flower || !flower.household_id) {
          console.error('Flower not found or missing household_id:', { flowerId, flower })
          return reply.code(404).send({ error: `Flower with ID ${flowerId} not found or missing household_id` })
        }
        householdId = flower.household_id.toString()
        console.log('Found household_id from flower:', householdId)
      } catch (error) {
        console.error('Error fetching flower:', error)
        return reply.code(500).send({ error: 'Error fetching flower data' })
      }
    }

    if (!householdId) {
      console.error('No household ID found in request:', {
        query: requestData.query,
        params: requestData.params,
        body: requestData.body,
      })
      return reply.code(400).send({ error: 'Household ID is required' })
    }

    let household: IHousehold
    try {
      console.log('Fetching household data for ID:', householdId)
      household = (await householdGetDao(householdId)) as IHousehold
      console.log('Found household:', { id: household._id, name: household.name })
    } catch (error) {
      console.error('Error fetching household:', error)
      return reply.code(500).send({ error: 'Error fetching household data' })
    }

    const userId = (request.user as { id?: string })?.id

    if (!userId) {
      console.error('No user ID found in request')
      return reply.code(401).send({ error: 'Unauthorized: User ID missing' })
    }

    let hasAccess = false

    for (const role of authorizedRole) {
      if (role === 'owner' && isOwner(household, userId)) {
        hasAccess = true
        break
      }
      if (role === 'member' && isMember(household, userId)) {
        hasAccess = true
        break
      }
    }

    if (!hasAccess) {
      console.error('Access denied for user:', { userId, householdId, authorizedRole })
      return reply.code(403).send({ error: 'Access denied' })
    }

    console.log('Access granted for user:', { userId, householdId, authorizedRole })
  }
}
