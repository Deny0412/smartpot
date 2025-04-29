import { CreateHouseholdData, Household } from '../../types/householdTypes'
import { api } from './api'

interface ApiHousehold extends Household {
    _id?: string
}

interface HouseholdResponse {
    status: string
    data: ApiHousehold[]
}

export const fetchHouseholds = async (): Promise<HouseholdResponse> => {
    const response = await api.get<HouseholdResponse>('/household/list')
    return {
        ...response.data,
        data: response.data.data.map(household => ({
            ...household,
            id: household._id || household.id,
        })),
    }
}

export const addHousehold = async (data: CreateHouseholdData): Promise<Household> => {
    const response = await api.post<Household>('/household/create', {
        name: data.name,
        members: [],
        invites: [],
    })
    return response.data
}

export const deleteHousehold = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/household/delete', { data: { id } })
    return response.data
}

export const updateHousehold = async (id: string, household: Partial<Household>): Promise<Household> => {
    const response = await api.put<Household>('/household/update', { ...household, id })
    return response.data
}

export const leaveHousehold = async (id: string): Promise<void> => {
    const response = await api.put(`/household/leave`, { id })
    return response.data
}
