import { Household } from '../../types/householdTypes'
import { api } from './api'

export const fetchHouseholds = async (): Promise<Household[]> => {
    const response = await api.get<Household[]>('/households')
    return response.data
}

export const addHousehold = async (household: Omit<Household, 'id'>): Promise<Household> => {
    const response = await api.post<Household>('/households', household)
    return response.data
}

export const deleteHousehold = async (id: string): Promise<void> => {
    await api.delete(`/households/${id}`)
}

export const updateHousehold = async (id: string, household: Partial<Household>): Promise<Household> => {
    const response = await api.put<Household>(`/households/${id}`, household)
    return response.data
}
