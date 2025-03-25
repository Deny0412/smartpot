import MeasurementModel from '../../models/Measurement';

async function getFlowerHistory(flower_id: string) {
    const history = await MeasurementModel.find({ flower_id })
        .sort({ timestamp: -1 })
        .limit(100); // Limit to last 100 measurements
    return history;
}

export default getFlowerHistory; 