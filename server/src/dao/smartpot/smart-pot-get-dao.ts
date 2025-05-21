import SmartPotModel from '../../models/SmartPot';

async function getSmartPot(id: string) {
    
    const smartpot = await SmartPotModel.findById(id);
    return smartpot;
}

export default getSmartPot;
