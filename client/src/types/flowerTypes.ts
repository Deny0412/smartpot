export interface Measurement {
    id: string
    flower_id: string
    humidity: number
    temperature: number
    light: number
    water_level: number
    created_at: string
}

interface MeasurementSettings {
    min: number
    max: number
}

export interface Flower {
    id: string
    name: string
    avatar: string
    household_id: string
    profile_id: string | null
    serial_number: string | null
    temperature?: { min: number; max: number }
    humidity?: { min: number; max: number }
    light?: { min: number; max: number }
}

export interface FlowerProfile {
    id: string
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
    id: string
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
    id: string
    flower_id: string
    active: boolean
    monday: { from: string | null; to: string | null }
    tuesday: { from: string | null; to: string | null }
    wednesday: { from: string | null; to: string | null }
    thursday: { from: string | null; to: string | null }
    friday: { from: string | null; to: string | null }
    saturday: { from: string | null; to: string | null }
    sunday: { from: string | null; to: string | null }
}

export interface SmartPot {
    id: string
    serial_number: string
    household_id: string | null
    active_flower_id: string | null
}
