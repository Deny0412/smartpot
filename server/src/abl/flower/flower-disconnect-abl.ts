import { FastifyReply } from 'fastify'
import { getFlower } from '../../dao/flower/flower-get-dao'
import updateFlower from '../../dao/flower/flower-update-dao'
import smartpotGetBySerialNumberDao from '../../dao/smartpot/smart-pot-get-by-serial-number'
import updateSmartPot from '../../dao/smartpot/smart-pot-update-dao'
import { sendError, sendSuccess } from '../../middleware/response-handler'

interface DisconnectFlowerDto {
  id: string
}

export const flowerDisconnectAbl = async (dtoIn: DisconnectFlowerDto, reply: FastifyReply) => {
  try {
    if (!dtoIn.id) {
      return sendError(reply, 'ID of flower is required')
    }
    const flower = await getFlower(dtoIn.id)
    if (!flower) {
      return sendError(reply, 'Flower was not found')
    }

    const smartPot = await smartpotGetBySerialNumberDao(flower.serial_number)
    if (!smartPot) {
      return sendError(reply, 'Smartpot was not found')
    }

    const updatedFlower = await updateFlower(dtoIn.id, {
      serial_number: '',
    })

    if (!updatedFlower) {
      return sendError(reply, 'Failed to update flower')
    }

    const updatedSmartPot = await updateSmartPot({
      serial_number: smartPot.serial_number,
      household_id: smartPot.household_id,
      active_flower_id: null,
    })

    if (!updatedSmartPot) {
      return sendError(reply, 'Failed to update smartpot')
    }

    return sendSuccess(reply, {
      success: true,
      message: 'Flower was successfully disconnected from smartpot',
      data: {
        flower: updatedFlower,
        smartPot: updatedSmartPot,
      },
    })
  } catch (error) {
    console.error('Error while disconnecting flower from smartpot', error)
    return sendError(reply, 'Error while disconnecting flower from smartpot')
  }
}
