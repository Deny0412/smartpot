import PotModel, { IPot } from '../../models/Pot';

async function updatePot(id: string, potData: IPot) {


    const existingPot = await PotModel.findById(id);
    if (!existingPot) {
        return null; 
    }
    const updatedPot = await PotModel.findByIdAndUpdate(
        id,
        { $set: { name: potData.name, id_profile: potData.id_profile } },
        { new: true }
    );
    return updatedPot;
}

export default updatePot; 
