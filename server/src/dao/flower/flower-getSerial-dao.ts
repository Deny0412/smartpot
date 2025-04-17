import FlowerModel from "../../models/Flower";

async function getSerialFlowerDao(serial_number: string) {
  const flower = await FlowerModel.findOne({ serial_number });
  return flower;
}

export default getSerialFlowerDao;
