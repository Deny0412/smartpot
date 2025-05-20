import { FastifyReply } from 'fastify'
import disconnectSmartPot from '../../dao/smartpot/smart-pot-disconnect-dao'
import getSmartBySerialNumberPot from '../../dao/smartpot/smart-pot-get-by-serial-number'
import { sendClientError, sendError, sendNotFound, sendSuccess } from '../../middleware/response-handler'

export const smartpotDisconnectAbl = async (data: { serial_number: string }, reply: FastifyReply) => {
  try {
    console.log('Disconnect request data:', data)

    if (!data.serial_number) {
      console.error('Missing serial_number')
      return sendClientError(reply, 'Missing serial_number')
    }

    // Najprv skontrolujeme, či smart pot existuje
    const existingSmartPot = await getSmartBySerialNumberPot(data.serial_number)
    console.log('Existing smart pot:', existingSmartPot)

    if (!existingSmartPot) {
      console.error('Smart pot not found with serial number:', data.serial_number)
      return sendNotFound(reply, 'SmartPot not found')
    }

    // Odpojíme smart pot
    const updatedSmartPot = await disconnectSmartPot(data.serial_number)
    console.log('Updated smart pot:', updatedSmartPot)

    if (!updatedSmartPot) {
      console.error('Failed to disconnect smart pot')
      return sendError(reply, 'Failed to disconnect smart pot')
    }

    return sendSuccess(reply, updatedSmartPot, 'SmartPot disconnected successfully')
  } catch (error) {
    console.error('Error in smartpotDisconnectAbl:', error)
    return sendError(reply, error)
  }
}

export default smartpotDisconnectAbl
