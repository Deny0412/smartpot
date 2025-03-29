import { IFlower } from '../../models/Flower'; 
import create from '../flower/flower-create-dao'; 
import deleteFlower from '../flower/flower-delete-dao';
import updateFlower from '../flower/flower-update-dao'; 
import listFlowers from '../flower/flower-list-dao';
import getFlower from '../flower/flower-get-dao';
import getFlowerHistory from '../flower/flower-history-dao';
import { MongoValidator } from '../../validation/mongo-validator';
import { IMeasurement } from '@/models/Measurement';
import addMeasurement from '../flower/flower-measurement-add';
import FlowerModel from '../../models/Flower';

async function createFlower(data: IFlower) {
    return await create(data); 
}

async function getFlowerById(id: string) {
    try {
        MongoValidator.validateId(id);
        return await getFlower(id);
    } catch (error) {
        return null;
    }
}

async function listFlowersByHousehold(page: number, household_id: string, limit: number) {
    try {
        //MongoValidator.validateId(id_household);
        return await listFlowers(page, household_id, limit);
    } catch (error) {
        //return { itemList: [], pageInfo: { total: 0, page, limit } };
        return null;
    }
}

async function updateFlowerById(id: string, data: IFlower) {
    try {
        MongoValidator.validateId(id);
        return await updateFlower(id, data);
    } catch (error) {
        return null;
    }
}

async function deleteFlowerById(id: string) {
    try {
        MongoValidator.validateId(id);
        return await deleteFlower(id);
    } catch (error) {
        return null;
    }
}

async function getFlowerHistoryById(flower_id: string) {
    try {
        MongoValidator.validateId(flower_id);
        return await getFlowerHistory(flower_id);
    } catch (error) {
        return null;
    }
}

async function addMeasurementById(data: IMeasurement) {
    return await addMeasurement(data);
}

async function checkFlowerExists(id: string) {
    const flower = await FlowerModel.findById(id);
    return !!flower;
}

export default {
    createFlower,
    getFlower: getFlowerById,
    listFlowers: listFlowersByHousehold,
    updateFlower: updateFlowerById, 
    deleteFlower: deleteFlowerById, 
    getFlowerHistory: getFlowerHistoryById,
    addMeasurement: addMeasurementById,
    checkFlowerExists,
};
