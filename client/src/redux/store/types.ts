import { MeasurementType, MeasurementValue, Schedule } from '../../types/flowerTypes'
import { User } from '../../types/userTypes'
import { HouseholdInvite } from '../services/invitesApi'

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
    users: { [key: string]: User }
    loading: boolean
    error: string | null
}

export interface InvitesState {
    invites: HouseholdInvite[]
    loading: boolean
    error: string | null
}

export interface SmartPotsState {
    smartPots: any[]
    inactiveSmartPots: any[]
    loading: boolean
    error: string | null
    status: string
}
