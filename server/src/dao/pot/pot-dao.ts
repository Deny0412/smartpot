import { IPot } from '../../models/Pot'; 
import create from './pot-create-dao'; 
import deletePot from './pot-delete-dao';
import updatePot from './pot-update-dao'; 
import listPots from './pot-list-dao';
import getPot from './pot-get-dao';


async function createPot(data: IPot) {
    return await create(data); 
}


async function getPotById(id: string) {
    return await getPot(id);
}


async function listPotsByHousehold(page: any, householdId: string) {
    return await listPots(page, householdId);
}


async function updatePotById(id: string, data: IPot) {
    return await updatePot(id, data); 
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
