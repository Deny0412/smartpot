import PotModel from '../../models/Pot';
import mongoose from 'mongoose';

async function getPot(id: string) {
    // Check if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    
    const pot = await PotModel.findById(id);
    return pot;
}

export default getPot;
