import PotModel from '../../models/Pot';

async function getPot(id: string) {
    
    const pot = await PotModel.findById(id);
    return pot;
}

export default getPot;
