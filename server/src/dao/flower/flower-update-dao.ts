import FlowerModel, { IFlower } from '../../models/Flower';

async function updateFlower(id: string, flowerData: IFlower) {


    const existingFlower = await FlowerModel.findById(id);
    if (!existingFlower) {
        return null; 
    }
    const updatedFlower = await FlowerModel.findByIdAndUpdate(
        id,
        { $set: { name: flowerData.name, profile_id: flowerData.profile_id, serial_number: flowerData.serial_number } },
        { new: true }
    );
    return updatedFlower;
}

export default updateFlower; 
