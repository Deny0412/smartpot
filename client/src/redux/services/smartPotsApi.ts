import { AxiosError } from 'axios'
import { SmartPot } from '../../types/flowerTypes'
import { api } from './api'
import { updateFlower } from './flowersApi'

export const loadSmartPots = async (householdId: string): Promise<SmartPot[]> => {
    const response = await api.get<{ status: string; data: SmartPot[] }>(`/smart-pot/listByHousehold/${householdId}`)
    return response.data.data
}

export const updateSmartPot = async (serialNumber: string, smartPot: Partial<SmartPot>): Promise<SmartPot> => {
    const response = await api.put<{ status: string; data: SmartPot }>('/smart-pot/update', {
        serial_number: serialNumber,
        active_flower_id: smartPot.active_flower_id,
        household_id: smartPot.household_id,
    })
    return response.data.data
}

export const disconnectSmartPot = async (serialNumber: string, householdId: string, activeFlowerId: string | null) => {
    try {
        const requestData = {
            serial_number: serialNumber,
            household_id: householdId,
            active_flower_id: null,
        }
        const response = await api.put('/smart-pot/update', requestData)

        
        if (activeFlowerId) {
            await updateFlower(activeFlowerId, { serial_number: '' })
        }

        return response.data.data
    } catch (error) {
        console.error('Error disconnecting smart pot:', error)
        if (error instanceof AxiosError && error.response) {
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)
        }
        throw error
    }
}

export const transplantSmartPotWithFlower = async (
    smartPotId: string,
    targetHouseholdId: string,
): Promise<SmartPot> => {
    const response = await api.post<{ status: string; data: SmartPot }>(`/smart-pot/transplant-with-flower`, {
        smartPotId,
        targetHouseholdId,
    })
    return response.data.data
}

export const transplantSmartPotWithoutFlower = async (
    smartPotId: string,
    targetHouseholdId: string,
    assignOldFlower: boolean,
    newFlowerId: string,
): Promise<SmartPot> => {
    const response = await api.post<{ status: string; data: SmartPot }>(`/smart-pot/transplant-without-flower`, {
        smartPotId,
        targetHouseholdId,
        assignOldFlower,
        newFlowerId,
    })
    return response.data.data
}

export const transplantSmartPotToFlower = async (smartPotId: string, targetFlowerId: string): Promise<SmartPot> => {
    try {
        // First check if the target flower is already connected to a smart pot
        const flowerResponse = await api.get<{
            status: string
            data: { serial_number: string | null; household_id: string }
        }>(`/flower/get/${targetFlowerId}`)
        if (flowerResponse.data.data.serial_number) {
            throw new Error('Kvetina je už pripojená k smart potu')
        }

        const householdId = flowerResponse.data.data.household_id

        
        const smartPotResponse = await api.get<{ status: string; data: SmartPot }>(
            `/smart-pot/get/${smartPotId}?household_id=${householdId}`,
        )
        const smartPot = smartPotResponse.data.data

        
        const smartPotUpdateData = {
            serial_number: smartPot.serial_number,
            active_flower_id: targetFlowerId,
            household_id: householdId,
        }
  
        const response = await api.put<{ status: string; data: SmartPot }>('/smart-pot/update', smartPotUpdateData)

        const flowerUpdateData = {
            id: targetFlowerId,
            serial_number: smartPot.serial_number,
        }

        await api.put('/flower/update', flowerUpdateData)

        return response.data.data
    } catch (error) {
        console.error('Transplant error details:', error)
        if (error instanceof AxiosError) {
            console.error('Request data:', error.config?.data)
            console.error('Response data:', error.response?.data)
        }
        throw error
    }
}
