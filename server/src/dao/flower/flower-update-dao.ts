import { Types } from 'mongoose'
import FlowerModel from '../../models/Flower'

async function updateFlower(id: string, flowerData: any) {
  console.log('=== DAO - Vstupné dáta ===')
  console.log('ID:', id)
  console.log('Dáta:', flowerData)

  
  const updateData: any = {
    $set: {},
    $unset: {},
  }


  Object.entries(flowerData).forEach(([key, value]) => {
    if (key !== '_id') {
      if (value === undefined || value === null) {
        updateData.$unset[key] = ''
      } else {
        updateData.$set[key] = value
      }
    }
  })

  
  if (updateData.$set.profile) {
    updateData.$unset.profile_id = ''
  }


  if (updateData.$set.profile_id) {
    updateData.$unset.profile = ''
  }

  
  if (Object.keys(updateData.$set).length === 0) {
    delete updateData.$set
  }

  
  if (Object.keys(updateData.$unset).length === 0) {
    delete updateData.$unset
  }

  

  
  const result = await FlowerModel.updateOne(
    { _id: new Types.ObjectId(id) },
    updateData,
    { new: true }
  )



  
  const flower = await FlowerModel.findOne({ _id: new Types.ObjectId(id) }).lean()



  if (!flower) {
    return null
  }

  return {
    ...flower,
    _id: flower._id.toString(),
  }
}

export default updateFlower
