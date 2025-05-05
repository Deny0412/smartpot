import { Types } from 'mongoose'
import FlowerModel from '../../models/Flower'

async function updateFlower(id: string, flowerData: any) {
  console.log('=== DAO - Vstupné dáta ===')
  console.log('ID:', id)
  console.log('Dáta:', flowerData)

  // Vytvoríme update objekt
  const updateData: any = {
    $set: {},
    $unset: {},
  }

  // Spracujeme všetky polia okrem _id
  Object.entries(flowerData).forEach(([key, value]) => {
    if (key !== '_id') {
      if (value === undefined || value === null) {
        updateData.$unset[key] = ''
      } else {
        updateData.$set[key] = value
      }
    }
  })

  // Ak máme custom profil, odstránime profile_id
  if (updateData.$set.profile) {
    updateData.$unset.profile_id = ''
  }

  // Ak máme globálny profil, odstránime profile
  if (updateData.$set.profile_id) {
    updateData.$unset.profile = ''
  }

  // Ak nemáme žiadne polia na nastavenie, odstránime $set
  if (Object.keys(updateData.$set).length === 0) {
    delete updateData.$set
  }

  // Ak nemáme žiadne polia na odstránenie, odstránime $unset
  if (Object.keys(updateData.$unset).length === 0) {
    delete updateData.$unset
  }

  console.log('=== DAO - Finálne dáta pre aktualizáciu ===')
  console.log('Update data:', updateData)

  // Najprv vykonáme aktualizáciu
  const result = await FlowerModel.updateOne(
    { _id: new Types.ObjectId(id) },
    updateData,
    { new: true } // Vráti aktualizovaný dokument
  )

  console.log('=== DAO - Výsledok aktualizácie ===')
  console.log('Result:', result)

  // Potom získame aktualizovaný dokument
  const flower = await FlowerModel.findOne({ _id: new Types.ObjectId(id) }).lean()

  console.log('=== DAO - Aktualizovaný dokument ===')
  console.log('Flower:', flower)

  if (!flower) {
    return null
  }

  return {
    ...flower,
    _id: flower._id.toString(),
  }
}

export default updateFlower
