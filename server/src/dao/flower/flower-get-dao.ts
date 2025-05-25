import FlowerModel from "../../models/Flower";

async function flowerGetDao(id: string) {
  const flower = await FlowerModel.findById(id);
  return flower;
}

export default flowerGetDao;
