import FlowerModel from '../../models/Flower';

async function listFlowers(page: number = 1, household_id: string, limit: number = 10) {
    // Ensure page and limit are numbers
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

    const query = { household_id };
    
    const [flowers, total] = await Promise.all([
        FlowerModel.find(query)
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit),
        FlowerModel.countDocuments(query)
    ]);

    return {
        itemList: flowers,
        pageInfo: {
            total,
            page: parsedPage,
            limit: parsedLimit
        }
    };
}

export default listFlowers;
