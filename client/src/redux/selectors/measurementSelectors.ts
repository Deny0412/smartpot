import { Measurements } from '../../types/flowerDetailTypes'
import { RootState } from '../store/rootReducer'

export const selectMeasurementsForFlower = (state: RootState, flowerId: string): Measurements => {
    return (
        state.measurements.measurements[flowerId] || {
            humidity: [],
            temperature: [],
            light: [],
            battery: [],
            water: [],
        }
    )
}

export const selectMeasurementsLoading = (state: RootState) => state.measurements.loading

export const selectMeasurementsError = (state: RootState) => state.measurements.error

export const selectAllMeasurements = (state: RootState) => state.measurements.measurements

export const selectLatestMeasurement = (state: RootState, flowerId: string) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) return null

    const latestHumidity = measurements.humidity[0]
    const latestTemperature = measurements.temperature[0]
    const latestLight = measurements.light[0]
    const latestBattery = measurements.battery?.[0]
    const latestWater = measurements.water?.[0]

    return {
        humidity: latestHumidity,
        temperature: latestTemperature,
        light: latestLight,
        battery: latestBattery,
        water: latestWater,
    }
}

// Nové selektory pre FlowerpotMeasurment
export const selectProcessedMeasurements = (state: RootState, flowerId: string) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) {
        return {
            humidity: [],
            temperature: [],
            light: [],
            battery: [],
        }
    }

    return {
        humidity: measurements.humidity.map(m => ({
            timestamp: m.createdAt,
            humidity: Number(m.value),
        })),
        temperature: measurements.temperature.map(m => ({
            timestamp: m.createdAt,
            temperature: Number(m.value),
        })),
        light: measurements.light.map(m => ({
            timestamp: m.createdAt,
            light: Number(m.value),
        })),
        battery:
            measurements.battery?.map(m => ({
                timestamp: m.createdAt,
                battery: Number(m.value),
            })) || [],
    }
}

export const selectFilteredMeasurements = (
    state: RootState,
    flowerId: string,
    measurementType: 'humidity' | 'temperature' | 'light' | 'battery',
    selectedDate?: string,
) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) return []

    if (!selectedDate || selectedDate === '') {
        return measurements[measurementType] || []
    }

    const selectedDateObj = new Date(selectedDate)
    selectedDateObj.setHours(0, 0, 0, 0)
    const nextDay = new Date(selectedDateObj)
    nextDay.setDate(nextDay.getDate() + 1)

    return (measurements[measurementType] || []).filter(measurement => {
        const measurementDate = new Date(measurement.createdAt)
        return measurementDate >= selectedDateObj && measurementDate < nextDay
    })
}

export const selectChartData = (
    state: RootState,
    flowerId: string,
    measurementType: 'humidity' | 'temperature' | 'light' | 'battery',
    timeRange: 'day' | 'week' | 'month' | 'custom',
    customDateRange?: { from: string; to: string },
) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements || !measurements[measurementType]) return []

    const data = measurements[measurementType]
        .map(m => ({
            timestamp: m.createdAt,
            value: Number(m.value),
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    if (!data || data.length === 0) return data

    const now = new Date()
    let startDate = new Date(now)

    if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
        const fromDate = new Date(customDateRange.from)
        const toDate = new Date(customDateRange.to)
        toDate.setHours(23, 59, 59, 999)

        return data
            .filter(item => {
                const itemDate = new Date(item.timestamp)
                return itemDate >= fromDate && itemDate <= toDate
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    switch (timeRange) {
        case 'day':
            startDate.setHours(0, 0, 0, 0)
            break
        case 'week':
            startDate.setDate(now.getDate() - 7)
            break
        case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
    }
    startDate.setHours(0, 0, 0, 0)

    return data
        .filter(item => {
            const itemDate = new Date(item.timestamp)
            return itemDate >= startDate && itemDate <= now
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export const selectMeasurementLimits = (
    state: RootState,
    flowerId: string,
    measurementType: 'humidity' | 'temperature' | 'light' | 'battery',
) => {
    if (measurementType === 'battery') {
        return { min: 30, max: 100 }
    }

    const flower = state.flowers.selectedFlower
    if (!flower) {
        const defaults = {
            humidity: { min: 0, max: 100 },
            temperature: { min: -20, max: 50 },
            light: { min: 0, max: 100 },
            battery: { min: 0, max: 100 },
        }
        return defaults[measurementType]
    }

    if (flower.profile_id) {
        const profile = state.flowerProfiles.profiles.find(p => p._id === flower.profile_id)
        if (profile?.[measurementType]) {
            return {
                min: profile[measurementType].min,
                max: profile[measurementType].max,
            }
        }
    }

    if (flower.profile?.[measurementType]) {
        return {
            min: flower.profile[measurementType].min,
            max: flower.profile[measurementType].max,
        }
    }

    const defaults = {
        humidity: { min: 0, max: 100 },
        temperature: { min: -20, max: 50 },
        light: { min: 0, max: 100 },
        battery: { min: 0, max: 100 },
    }
    return defaults[measurementType]
}
