import FlowerModel from "../../models/Flower";

async function checkFlowerExists(id: string) {
    const flower = await FlowerModel.findById(id);
    return !!flower;
}

export default checkFlowerExists;
