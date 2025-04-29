import { Measurements } from '../../types/flowerDetailTypes'
import { ScheduleResponse } from '../../types/flowerTypes'
import { RootState } from '../store/rootReducer'

export const selectFlower = (state: RootState) => state.flowers.selectedFlower

export const selectProfiles = (state: RootState) => state.flowerProfiles.profiles

export const selectMeasurements = (state: RootState, flowerId: string): Measurements => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) {
        return {
            humidity: [],
            temperature: [],
            light: [],
        }
    }
    return measurements as Measurements
}

export const selectLoading = (state: RootState) =>
    state.measurements.loading || state.flowers.loading || state.flowerProfiles.loading || state.schedule.loading

export const selectError = (state: RootState) =>
    state.measurements.error || state.flowers.error || state.flowerProfiles.error || state.schedule.error

export const selectSchedule = (state: RootState) => state.schedule.schedule as unknown as ScheduleResponse
