import MeasurementModel from '../../models/Measurement';
import PotModel, { IMeasurement } from '../../models/Measurement';

async function addMeasurement(data: IMeasurement) {
    const newMeasurement = new MeasurementModel(data);
    await newMeasurement.save();
    return newMeasurement;
}

export default addMeasurement;
