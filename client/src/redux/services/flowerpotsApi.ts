import { api } from './api'

export interface SmartPot {
    id: string
    serial_number: string
    household_id: string | null
    active_flower_id: string | null
}

export const flowerpotsApi = {
    getHouseholdSmartPots: async (householdId: string): Promise<SmartPot[]> => {
        const response = await api.get(`/smart-pots/household/${householdId}`)
        return response.data
    },
    getInactiveHouseholdSmartPots: async (householdId: string): Promise<SmartPot[]> => {
        const response = await api.get(`/smart-pots/household/empty/${householdId}`)
        return response.data
    },
    deleteSmartPot: async (smartPotId: string): Promise<void> => {
        await api.delete(`/smart-pots/${smartPotId}`)
    },
    connectSmartPot: async (smartPot: SmartPot): Promise<SmartPot> => {
        const response = await api.post('/smart-pots', smartPot)
        return response.data
    },
    disconnectSmartPot: async (smartPotId: string): Promise<void> => {
        await api.delete(`/smart-pots/${smartPotId}`)
    },
    getSmartPot: async (smartPotId: string): Promise<SmartPot> => {
        const response = await api.get(`/smart-pots/${smartPotId}`)
        return response.data
    },
    updateSmartPot: async (smartPotId: string, smartPot: SmartPot): Promise<SmartPot> => {
        const response = await api.put(`/smart-pots/${smartPotId}`, smartPot)
        return response.data
    },
}
