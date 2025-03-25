import { IPot } from '../../models/Pot'; 
import create from './pot-create-dao'; 
import deletePot from './pot-delete-dao';
import updatePot from './pot-update-dao'; 
import listPots from './pot-list-dao';
import getPot from './pot-get-dao';
import { MongoValidator } from '../../utils/mongo-validator';



async function createPot(data: IPot) {
    return await create(data); 
}

async function getPotById(id: string) {
    try {
        MongoValidator.validateId(id);
        return await getPot(id);
    } catch (error) {
        return null;
    }
}

async function listPotsByHousehold(page: number, id_household: string, limit: number) {
    try {
        //MongoValidator.validateId(id_household);
        console.log("id_household", id_household);
        return await listPots(page, id_household, limit);
    } catch (error) {
        //return { itemList: [], pageInfo: { total: 0, page, limit } };
        return null;
    }
}

async function updatePotById(id: string, data: IPot) {
    try {
        MongoValidator.validateId(id);
        return await updatePot(id, data);
    } catch (error) {
        return null;
    }
}

async function deletePotById(id: string) {
    try {
        MongoValidator.validateId(id);
        return await deletePot(id);
    } catch (error) {
        return null;
    }
}

export default {
    createPot,
    getPot: getPotById,
    listPots: listPotsByHousehold,
    updatePot: updatePotById, 
    deletePot: deletePotById, 
};
