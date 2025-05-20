import SmartPotModel from '../../models/SmartPot';

async function checkSmartPotExists(serial_number: string) {
    
    const smartpot = await SmartPotModel.findOne({ serial_number });
    return !!smartpot;
}

export default checkSmartPotExists;
