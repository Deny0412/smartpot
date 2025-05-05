export interface BaseMeasurement {
    _id: string
    flower_id: string
    createdAt: string
    updatedAt: string
    type: MeasurementType
}

export interface WaterMeasurement extends BaseMeasurement {
    value: string
    type: 'water'
}

export interface BatteryMeasurement extends BaseMeasurement {
    value: number
    type: 'battery'
}

export interface TemperatureMeasurement extends BaseMeasurement {
    value: number
    type: 'temperature'
}

export interface LightMeasurement extends BaseMeasurement {
    value: number
    type: 'light'
}

export interface HumidityMeasurement extends BaseMeasurement {
    value: number
    type: 'humidity'
}

export type MeasurementType = 'water' | 'temperature' | 'light' | 'humidity' | 'battery'
export type MeasurementValue =
    | WaterMeasurement
    | TemperatureMeasurement
    | LightMeasurement
    | HumidityMeasurement
    | BatteryMeasurement

interface MeasurementSettings {
    min: number
    max: number
}

export interface Flower {
    _id: string
    name: string
    avatar: string
    household_id: string
    profile_id: string | null
    serial_number: string | null
    keepSmartPot?: boolean
    profile?: {
        temperature: { min: number; max: number }
        humidity: { min: number; max: number }
        light: { min: number; max: number }
    }
}

export interface FlowerProfile {
    _id: string
    name: string

    temperature: {
        min: number
        max: number
    }
    humidity: {
        min: number
        max: number
    }
    light: {
        min: number
        max: number
    }
    created_at: string
    updated_at: string
}

export interface Gateway {
    _id: string
    serialNumber: string
    idHousehold: string
    status: 'online' | 'offline'
    lastSync: Date
    connectedDevices: {
        deviceId: string
        status: 'active' | 'inactive'
        lastUpdate: Date
    }[]
}

export interface Schedule {
    _id?: string
    flower_id: string
    active: boolean
    monday: { from: string | null; to: string | null }
    tuesday: { from: string | null; to: string | null }
    wednesday: { from: string | null; to: string | null }
    thursday: { from: string | null; to: string | null }
    friday: { from: string | null; to: string | null }
    saturday: { from: string | null; to: string | null }
    sunday: { from: string | null; to: string | null }
    createdAt?: string
    updatedAt?: string
}

export interface ScheduleResponse {
    status: string
    data: Schedule
}

export interface SmartPot {
    _id: string
    serial_number: string
    household_id: string
    active_flower_id: string | null
    createdAt: string
    updatedAt: string
}
