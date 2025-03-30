import SmartPotModel, { ISmartPot } from '../../models/SmartPot';

async function updateSmartPot(serial_number: string, smartpotData: ISmartPot) {


    const existingSmartPot = await SmartPotModel.findOne({serial_number: serial_number});
    if (!existingSmartPot) {
        return null; 
    }
    const updatedSmartPot = await SmartPotModel.findOneAndUpdate(
        {serial_number: serial_number},
        { $set: { household_id: smartpotData.household_id,} },
        { new: true }
    );
    return updatedSmartPot;
}

export default updateSmartPot; 
