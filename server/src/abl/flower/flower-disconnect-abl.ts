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
    // 1. Validácia vstupných dát
    if (!dtoIn.id) {
      return sendError(reply, 'ID kvetiny je povinné')
    }

    // 2. Získanie kvetiny
    const flower = await getFlower(dtoIn.id)
    if (!flower) {
      return sendError(reply, 'Kvetina nebola nájdená')
    }

    // 3. Získanie smartpotu
    const smartPot = await smartpotGetBySerialNumberDao(flower.serial_number)
    if (!smartPot) {
      return sendError(reply, 'Smartpot nebol nájdený')
    }

    // 4. Aktualizácia kvetiny - odstránenie serial_number
    const updatedFlower = await updateFlower(dtoIn.id, {
      serial_number: '',
    })

    if (!updatedFlower) {
      return sendError(reply, 'Nepodarilo sa aktualizovať kvetinu')
    }

    // 5. Aktualizácia smartpotu - odstránenie active_flower_id
    const updatedSmartPot = await updateSmartPot({
      serial_number: smartPot.serial_number,
      household_id: smartPot.household_id,
      active_flower_id: null,
    })

    if (!updatedSmartPot) {
      return sendError(reply, 'Nepodarilo sa aktualizovať smartpot')
    }

    // 6. Odoslanie úspešnej odpovede
    return sendSuccess(reply, {
      success: true,
      message: 'Kvetina bola úspešne odpojená od smartpotu',
      data: {
        flower: updatedFlower,
        smartPot: updatedSmartPot,
      },
    })
  } catch (error) {
    console.error('Chyba pri odpojení kvetiny:', error)
    return sendError(reply, 'Nastala chyba pri odpojení kvetiny')
  }
}
