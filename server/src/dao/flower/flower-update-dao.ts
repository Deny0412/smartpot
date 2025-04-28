import { Types } from 'mongoose'
import FlowerModel from '../../models/Flower'

async function updateFlower(id: string, flowerData: any) {


  // Vytvoríme update objekt
  const updateData: any = {
    $set: {},
  }

  // Ak máme vlastný profil, odstránime profile_id a nastavíme profile
  if (flowerData.profile) {
    updateData.$set.profile = flowerData.profile
    updateData.$unset = { profile_id: 1 }
  }

  // Ak máme globálny profil, odstránime profile a nastavíme profile_id
  if (flowerData.profile_id) {
    updateData.$set.profile_id = flowerData.profile_id
    updateData.$unset = { ...(updateData.$unset || {}), profile: 1 }
  }

  // Ak nemáme ani profile ani profile_id, odstránime oboje
  if (!flowerData.profile && !flowerData.profile_id) {
    updateData.$unset = {
      ...(updateData.$unset || {}),
      profile: 1,
      profile_id: 1,
    }
  }

  // Pridáme ostatné polia do $set
  Object.keys(flowerData).forEach((key) => {
    if (key !== 'profile' && key !== 'profile_id' && flowerData[key] !== undefined) {
      updateData.$set[key] = flowerData[key]
    }
  })

  console.log('=== DAO - Finálne dáta pre aktualizáciu ===')
  console.log('Update data:', updateData)

  // Najprv vykonáme aktualizáciu
  await FlowerModel.updateOne({ _id: new Types.ObjectId(id) }, updateData)

  // Potom získame aktualizovaný dokument s explicitne vybranými poliami
  const flower = await FlowerModel.findOne(
    { _id: new Types.ObjectId(id) },
    { profile_id: 1, name: 1, household_id: 1, avatar: 1, serial_number: 1, updatedAt: 1 }
  ).lean()

  console.log('=== DAO - Výsledok aktualizácie ===')
  console.log('Aktualizovaná kvetina:', flower)

  if (!flower) {
    return null
  }

  // Vrátime všetky potrebné polia vrátane profile_id
  return {
    ...flower,
    _id: flower._id.toString(),
    profile_id: flower.profile_id || flowerData.profile_id, // Pridáme profile_id z databázy alebo z vstupných dát
  }
}

export default updateFlower
