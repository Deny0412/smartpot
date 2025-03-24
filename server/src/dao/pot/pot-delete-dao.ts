import PotModel from '../../models/Pot';
import mongoose from 'mongoose';

async function deletePot(id: string) {
    
    const deletedPot = await PotModel.findByIdAndDelete(id);
    
    return deletedPot;
}

export default deletePot; 