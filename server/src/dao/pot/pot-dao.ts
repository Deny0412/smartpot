import { IPot } from '../../models/Pot'; 
import create from './pot-create-dao'; 
import deletePot from './pot-delete-dao';
import updatePot from './pot-update-dao'; 
import listPots from './pot-list-dao';
import getPot from './pot-get-dao';


async function createPot(potData: IPot) {
    return await create(potData); 
}


async function getPotById(id: string) {
    return await getPot(id);
}


async function listPotsByHousehold(pageInfo: any, householdId: string) {
    return await listPots(pageInfo, householdId);
}


async function updatePotById(id: string, potData: IPot) {
    return await updatePot(id, potData); 
}


async function deletePotById(id: string) {
    return await deletePot(id); 
}

export default {
    createPot,
    getPot: getPotById,
    listPots: listPotsByHousehold,
    updatePot: updatePotById, 
    deletePot: deletePotById, 
};
