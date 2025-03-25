import { IPot } from '../../models/Flower'; 
import create from '../pot/pot-create-dao'; 
import deletePot from '../pot/pot-delete-dao';
import updatePot from '../pot/pot-update-dao'; 
import listPots from '../pot/pot-list-dao';
import getPot from '../pot/pot-get-dao';
import getPotHistory from '../pot/pot-history-dao';
import { MongoValidator } from '../../utils/mongo-validator';
import { IMeasurement } from '@/models/Measurement';
import addMeasurement from '../pot/pot-measurement-add';
import PotModel from '../../models/Flower';

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

async function getPotHistoryById(pot_id: string) {
    try {
        MongoValidator.validateId(pot_id);
        return await getPotHistory(pot_id);
    } catch (error) {
        return null;
    }
}

async function addMeasurementById(data: IMeasurement) {
    return await addMeasurement(data);
}

async function checkPotExists(id: string) {
    const pot = await PotModel.findById(id);
    return !!pot;
}

export default {
    createPot,
    getPot: getPotById,
    listPots: listPotsByHousehold,
    updatePot: updatePotById, 
    deletePot: deletePotById, 
    getPotHistory: getPotHistoryById,
    addMeasurement: addMeasurementById,
    checkPotExists,
};
