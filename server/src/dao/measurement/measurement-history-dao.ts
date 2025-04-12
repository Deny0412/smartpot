import { IMeasurement } from "../../models/Measurement";
import MeasurementModel from "../../models/Measurement";

async function measurementHistoryDao(id: string, dateFrom: Date, dateTo: Date) {
  const records = await MeasurementModel.find({
    flower_id: id,
    createdAt: {
      $gte: new Date(dateFrom),
      $lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)), // Set the time of dateTo to the end of the day
    },
  })
    .sort({ createdAt: 1 })
    .lean();

  return records;
}
export default measurementHistoryDao;
