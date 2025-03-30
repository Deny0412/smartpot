import SmartPotModel, { ISmartPot } from '../../models/SmartPot';

async function updateSmartPot(smartpotData: ISmartPot) {


    const existingSmartPot = await SmartPotModel.findOne({serial_number: smartpotData.serial_number});
    if (!existingSmartPot) {
        return null; 
    }
    const updatedSmartPot = await SmartPotModel.findOneAndUpdate(
        {serial_number: smartpotData.serial_number},
        { $set: {serial_number: smartpotData.serial_number, household_id: smartpotData.household_id, active_flower_id: smartpotData.active_flower_id,} },
        { new: true }
    );
    return updatedSmartPot;
}

export default updateSmartPot; 
