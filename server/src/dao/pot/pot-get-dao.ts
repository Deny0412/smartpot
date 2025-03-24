import PotModel from '../../models/Pot';

async function getPot(id: string) {
    return await PotModel.findById(id);
}

export default getPot;
