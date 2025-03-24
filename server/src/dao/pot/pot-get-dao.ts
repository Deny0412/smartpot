import PotModel from '../../models/Pot';
import { sendError } from '../../middleware/response-handler';

async function getPot(id: string) {
 
    return await PotModel.findById(id);
}

export default getPot;
