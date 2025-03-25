import MeasurementModel from '../../models/Measurement';

async function getPotHistory(pot_id: string) {
    const history = await MeasurementModel.find({ pot_id })
        .sort({ timestamp: -1 })
        .limit(100); // Limit to last 100 measurements
    
    return history;
}

export default getPotHistory; 