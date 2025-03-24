import PotModel from '../../models/Pot'; 
import { IPot } from '../../models/Pot'; 


async function updatePot(id: string, potData: IPot) {
    return await PotModel.findByIdAndUpdate(id, potData, { new: true }); 
}

export default updatePot; 
