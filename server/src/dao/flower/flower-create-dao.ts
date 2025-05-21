import FlowerModel, { IFlower } from '../../models/Flower';

async function create(data: IFlower) {
    const flower = new FlowerModel(data);
    return await flower.save();
}

export default create; 
