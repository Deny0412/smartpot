import FlowerModel from '../../models/Flower'

async function createFlower(flowerData: any) {
  const flower = new FlowerModel(flowerData)
  const savedFlower = await flower.save()

  // Vrátime uloženú kvetinu s _id z MongoDB
  return savedFlower.toObject()
}

export default createFlower
