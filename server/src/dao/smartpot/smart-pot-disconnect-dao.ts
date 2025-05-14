import Flower from '../../models/Flower'
import SmartPot from '../../models/SmartPot'

export const disconnectSmartPot = async (serialNumber: string) => {
  try {
    // Najprv nájdeme smart pot a aktualizujeme ho
    const smartPot = await SmartPot.findOneAndUpdate(
      { serial_number: serialNumber },
      { $set: { active_flower_id: null } },
      { new: true }
    )

    // Potom nájdeme a aktualizujeme kvetinu, ktorá má tento smart pot
    await Flower.findOneAndUpdate({ serial_number: serialNumber }, { $set: { serial_number: '' } }, { new: true })

    return smartPot
  } catch (error) {
    console.error('Error in disconnectSmartPot DAO:', error)
    throw error
  }
}

export default disconnectSmartPot
