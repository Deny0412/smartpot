import FlowerModel from '../../models/Flower';

async function getFlower(id: string) {
    
    const flower = await FlowerModel.findById(id);
    return flower;
}

export default getFlower;
