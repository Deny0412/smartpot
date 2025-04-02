import FlowerModel, { IFlower } from '../../models/Flower';

async function updateFlower(id: string, flowerData: IFlower) {
console.log("flowerData",flowerData.profile);
    const existingFlower = await FlowerModel.findById(id);
    if (!existingFlower) {
        return null; 
    }
    const updatedFlower = await FlowerModel.findByIdAndUpdate(
        id,
        { $set: { name: flowerData.name, serial_number: flowerData.serial_number,household_id:flowerData.household_id,profile:flowerData.profile } },
        { new: true }
    );
    console.log("updatedFlower",updatedFlower);
    return updatedFlower;
}

export default updateFlower; 
