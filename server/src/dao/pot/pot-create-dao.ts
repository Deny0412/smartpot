import PotModel from '../../models/Pot';
import { IPot } from '../../models/Pot';

async function createPot(data: IPot) {
    const newPot = new PotModel(data);
    await newPot.save();
    return newPot;
}

export default createPot;
