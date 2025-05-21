import FlowerModel from '../../models/Flower';

async function deleteFlower(id: string) {
    const deletedFlower = await FlowerModel.findByIdAndDelete(id);
    return deletedFlower;
}

export default deleteFlower; 