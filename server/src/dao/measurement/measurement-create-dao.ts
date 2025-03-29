import { IMeasurement } from '../../models/Measurement'; 
import MeasurementModel from '../../models/Measurement';

async function createMeasurement(data: IMeasurement) {
    return await MeasurementModel.create(data); 
}


export default createMeasurement;
