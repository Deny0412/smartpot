import ScheduleModel from '../../models/Schedule';

async function getSchedule(id: string) {
    
    const schedule = await ScheduleModel.findById(id);
    return schedule;
}

export default getSchedule;
