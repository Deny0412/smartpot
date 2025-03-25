import PotModel from '../../models/Pot';

async function listPots(page: number = 1, id_household: string, limit: number = 10) {
    // Ensure page and limit are numbers
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

    const query = { id_household };
    
    const [pots, total] = await Promise.all([
        PotModel.find(query)
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit),
        PotModel.countDocuments(query)
    ]);

    return {
        itemList: pots,
        pageInfo: {
            total,
            page: parsedPage,
            limit: parsedLimit
        }
    };
}

export default listPots;
