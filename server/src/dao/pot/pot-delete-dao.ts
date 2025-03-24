import PotModel from '../../models/Pot';
import mongoose from 'mongoose';

async function deletePot(id: string) {
    // Check if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }
    
    const deletedPot = await PotModel.findByIdAndDelete(id);
    
    return deletedPot;
}

export default deletePot; 