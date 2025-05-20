import { ISmartPot } from '../../models/SmartPot'; 
import SmartPotModel from '../../models/SmartPot';

async function createSmartPot(data: ISmartPot) {
    return await SmartPotModel.create(data); 
}


export default createSmartPot;
   
