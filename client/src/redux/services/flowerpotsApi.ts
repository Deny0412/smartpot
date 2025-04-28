import { SmartPot } from '../../types/flowerTypes'
import { api } from './api'

interface ApiResponse<T> {
    status: string
    data: T
}

export const flowerpotsApi = {
    getHouseholdSmartPots: async (householdId: string): Promise<SmartPot[]> => {
        const response = await api.get<ApiResponse<SmartPot[]>>(`/smart-pot/household/${householdId}`)
        return response.data.data
    },
    getInactiveHouseholdSmartPots: async (householdId: string): Promise<SmartPot[]> => {
        try {
            const response = await api.get<ApiResponse<SmartPot[]>>(`/smart-pot/empty?household_id=${householdId}`)
            return response.data.data
        } catch (error: any) {
            if (error.response?.status === 404) {
                return []
            }
            throw error
        }
    },
    deleteSmartPot: async (smartPotId: string): Promise<void> => {
        await api.delete(`/smart-pot/${smartPotId}`)
    },
    connectSmartPot: async (smartPot: SmartPot): Promise<SmartPot> => {
        const response = await api.post<ApiResponse<SmartPot>>('/smart-pots', smartPot)
        return response.data.data
    },
    disconnectSmartPot: async (smartPotId: string): Promise<void> => {
        await api.delete(`/smart-pot/${smartPotId}`)
    },
    getSmartPot: async (smartPotId: string): Promise<SmartPot> => {
        const response = await api.get<ApiResponse<SmartPot>>(`/smart-pot/get/${smartPotId}`)
        return response.data.data
    },
    updateSmartPot: async (smartPotId: string, smartPot: SmartPot): Promise<SmartPot> => {
        const response = await api.put<ApiResponse<SmartPot>>(`/smart-pot/${smartPotId}`, smartPot)
        return response.data.data
    },
}
