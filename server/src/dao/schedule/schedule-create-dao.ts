import { Types } from 'mongoose'
import ScheduleModel, { ISchedule } from '../../models/Schedule'

async function hasActiveSchedule(flower_id: string | Types.ObjectId): Promise<boolean> {
  const activeSchedule = await ScheduleModel.findOne({
    flower_id,
    active: true,
  })
  return !!activeSchedule
}

async function createSchedule(data: ISchedule) {
  try {
    // If this schedule is active, deactivate all other schedules for this flower
    if (data.active) {
      await ScheduleModel.updateMany({ flower_id: data.flower_id, active: true }, { active: false })
    }
    const schedule = new ScheduleModel(data)
    return await schedule.save()
  } catch (error) {
    console.error('Error in createSchedule DAO:', error)
    throw error
  }
}

export { createSchedule, hasActiveSchedule }
