import { Pot } from '../../models/Pot'; // Adjust the import based on your model structure

async function createPot(potData: any) {
    const newPot = new Pot(potData);
    await newPot.save();
    return newPot;
}

export default createPot;
