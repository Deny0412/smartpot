import PotModel from '../../models/Pot'; 
import { IPot } from '../../models/Pot'; 


async function updatePot(id: string, potData: IPot) {
    const updatedPot = await PotModel.findByIdAndUpdate(id, potData, { new: true }); 
    return updatedPot;
}

export default updatePot; 
