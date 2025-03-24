import PotModel from '../../models/Pot';

async function listPots(pageInfo: any, householdId: string) {
    const { page = 1, limit = 10 } = pageInfo;
    const pots = await PotModel.find({ householdId })
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await PotModel.countDocuments({ householdId });
    return { itemList: pots, pageInfo: { total, page, limit } };
}

export default listPots;
