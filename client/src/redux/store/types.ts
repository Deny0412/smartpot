import { MeasurementType, MeasurementValue, Schedule } from '../../types/flowerTypes'

export interface ScheduleState {
    schedule: Schedule | null
    loading: boolean
    error: string | null
}

export interface AuthState {
    user: any | null
    loading: boolean
    error: string | null
}

export interface FlowersState {
    flowers: any[]
    selectedFlower: any | null
    loading: boolean
    error: string | null
}

export interface FlowerProfilesState {
    profiles: any[]
    loading: boolean
    error: string | null
}

export interface FlowerpotsState {
    flowerpots: any[]
    inactiveFlowerpots: any[]
    loading: boolean
    error: string | null
}

export interface HouseholdsState {
    households: any[]
    loading: boolean
    error: string | null
}

export interface MeasurementsState {
    measurements: { [key: string]: { [key in MeasurementType]: MeasurementValue[] } }
    loading: boolean
    error: string | null
}

export interface UsersState {
    users: any[]
    loading: boolean
    error: string | null
}
