import ScheduleModel from "../../models/Schedule";

async function getScheduleDao(flowerId: string) {
  const schedule = await ScheduleModel.findOne({ flower_id: flowerId });
  return schedule;
}

export default getScheduleDao;
