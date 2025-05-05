import { Measurements } from '../../types/flowerDetailTypes'
import { ScheduleResponse } from '../../types/flowerTypes'
import { RootState } from '../store/rootReducer'

export const selectFlower = (state: RootState) => state.flowers.selectedFlower

export const selectFlowers = (state: RootState) => state.flowers.flowers

export const selectMeasurements = (state: RootState, flowerId: string): Measurements => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) {
        return {
            humidity: [],
            temperature: [],
            light: [],
            battery: [],
            water: [],
        }
    }
    return measurements as Measurements
}

export const selectLoading = (state: RootState) =>
    state.measurements.loading || state.flowers.loading || state.flowerProfiles.loading || state.schedule.loading

export const selectError = (state: RootState) =>
    state.measurements.error || state.flowers.error || state.flowerProfiles.error || state.schedule.error

export const selectSchedule = (state: RootState) => state.schedule.schedule as unknown as ScheduleResponse

export const selectSmartPot = (state: RootState, serialNumber: string) => {
    const allPots = [...state.smartPots.smartPots, ...state.smartPots.inactiveSmartPots]
    return allPots.find(pot => pot.serial_number === serialNumber)
}

export const selectConnectedSmartPot = (state: RootState, flowerId: string) => {
    return state.smartPots.smartPots.find(pot => pot.active_flower_id === flowerId)
}

export const selectInactiveSmartPot = (state: RootState, flowerId: string) => {
    return state.smartPots.inactiveSmartPots.find(pot => pot.active_flower_id === flowerId)
}

export const selectLatestMeasurement = (state: RootState, flowerId: string, type: keyof Measurements) => {
    const measurements = selectMeasurements(state, flowerId)
    return measurements[type]?.[0] || null
}

export const selectBatteryStatus = (state: RootState, flowerId: string) => {
    const batteryMeasurement = selectLatestMeasurement(state, flowerId, 'battery')
    if (!batteryMeasurement) return null

    const batteryValue = Number(batteryMeasurement.value)
    return {
        value: batteryValue,
        hasWarning: batteryValue < 30 || batteryValue > 100,
    }
}


export const selectFlowerpotData = (state: RootState, flowerId: string) => {
    const flower = selectFlower(state)
    const measurements = selectMeasurements(state, flowerId)

    if (!flower) return null

    return {
        name: flower.name,
        status: 'active',
        flower_avatar: flower.avatar,
        humidity_measurement: measurements.humidity.map(m => ({
            timestamp: m.createdAt,
            humidity: Number(m.value),
        })),
        temperature_measurement: measurements.temperature.map(m => ({
            timestamp: m.createdAt,
            temperature: Number(m.value),
        })),
        light_measurement: measurements.light.map(m => ({
            timestamp: m.createdAt,
            light: Number(m.value),
        })),
        battery_measurement: measurements.battery.map(m => ({
            timestamp: m.createdAt,
            battery: Number(m.value),
        })),
        water_measurement: measurements.water.map(m => ({
            timestamp: m.createdAt,
            water: m.value,
        })),
    }
}
