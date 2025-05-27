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

export const disconnectSmartPot = async (
    serialNumber: string,
    householdId: string,
    activeFlowerId: string | null,
): Promise<{ success: boolean; message?: string; data?: SmartPot }> => {
    try {
        const requestData = {
            serial_number: serialNumber,
            household_id: householdId,
            active_flower_id: null,
        }

        if (activeFlowerId) {
            await updateFlower(activeFlowerId, { serial_number: '' })
        }

        const response = await api.put('/smart-pot/update', requestData)
        return { success: true, data: response.data.data }
    } catch (error) {
        console.error('Error disconnecting smart pot:', error)
        if (error instanceof AxiosError && error.response) {
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)
        }
        return { success: false, message: 'Failed to disconnect smart pot' }
    }
}

export const transplantSmartPotWithFlower = async (
    smartPotSerialNumber: string,
    targetHouseholdId: string,
    flowerId: string,
): Promise<{ success: boolean; message?: string }> => {
    try {
        await api.put('/flower/update', {
            id: flowerId,
            serial_number: '',
            household_id: targetHouseholdId,
        })

        await api.put('/smart-pot/update', {
            serial_number: smartPotSerialNumber,
            household_id: targetHouseholdId,
            active_flower_id: null,
        })

        await api.put('/flower/update', {
            id: flowerId,
            serial_number: smartPotSerialNumber,
            household_id: targetHouseholdId,
        })

        await api.put('/smart-pot/update', {
            serial_number: smartPotSerialNumber,
            household_id: targetHouseholdId,
            active_flower_id: flowerId,
        })

        return { success: true, message: 'Smart pot transplanted successfully' }
    } catch (error) {
        console.error('Transplant smartpot with flower error:', error)
        return { success: false, message: 'Failed to transplant smart pot' }
    }
}

export const transplantSmartPotWithoutFlower = async (
    smartPotSerialNumber: string,
    newSmartPotSerialNumber: string,
    targetHouseholdId: string,
    currentHouseholdId: string,
    assignOldFlower: boolean,
    oldFlowerId: string,
): Promise<{ success: boolean; message?: string; data?: SmartPot }> => {
    try {
        await api.put('/smart-pot/update', {
            serial_number: smartPotSerialNumber,
            active_flower_id: null,
            household_id: currentHouseholdId,
        })
        await api.put('/flower/update', {
            id: oldFlowerId,
            serial_number: '',
            household_id: currentHouseholdId,
        })

        let response
        
        if (assignOldFlower && newSmartPotSerialNumber) {
            await api.put('/smart-pot/update', {
                serial_number: newSmartPotSerialNumber,
                active_flower_id: oldFlowerId,
                household_id: currentHouseholdId,
            })

            await api.put('/flower/update', {
                id: oldFlowerId,
                serial_number: newSmartPotSerialNumber,
                household_id: currentHouseholdId,
            })

            response = await api.get<{ status: string; data: SmartPot }>(
                `/smart-pot/get/${smartPotSerialNumber}?household_id=${targetHouseholdId}`,
            )
        } else {
            response = await api.put<{ status: string; data: SmartPot }>('/smart-pot/update', {
                serial_number: smartPotSerialNumber,
                active_flower_id: null,
                household_id: targetHouseholdId,
            })
        }

        return {
            success: true,
            data: response.data.data,
            message: 'Smart pot transplanted successfully',
        }
    } catch (error) {
        console.error('Transplant error:', error)
        if (error instanceof AxiosError) {
            console.error('Request data:', error.config?.data)
            console.error('Response data:', error.response?.data)
        }
        return { success: false, message: 'Failed to transplant smart pot' }
    }
}

export const transplantSmartPotToFlower = async (
    smartPotId: string,
    targetFlowerId: string,
): Promise<{ success: boolean; message?: string; data?: SmartPot }> => {
    try {
      
        const flowerResponse = await api.get<{
            status: string
            data: { serial_number: string | null; household_id: string }
        }>(`/flower/get/${targetFlowerId}`)
        if (flowerResponse.data.data.serial_number) {
            return { success: false, message: 'Kvetina je už pripojená k smart potu' }
        }

        const householdId = flowerResponse.data.data.household_id

        const smartPotResponse = await api.get<{ status: string; data: SmartPot }>(
            `/smart-pot/get/${smartPotId}?household_id=${householdId}`,
        )
        const smartPot = smartPotResponse.data.data

        if (smartPot.active_flower_id) {
            await api.put('/flower/update', {
                id: smartPot.active_flower_id,
                serial_number: '',
                household_id: householdId,
            })
        }

        const updateData = {
            serial_number: smartPot.serial_number,
            active_flower_id: targetFlowerId,
            household_id: householdId,
        }

        const response = await api.put<{ status: string; data: SmartPot }>('/smart-pot/update', updateData)

        return {
            success: true,
            data: response.data.data,
            message: 'Smart pot transplanted successfully',
        }
    } catch (error) {
        console.error('Transplant error details:', error)
        if (error instanceof AxiosError) {
            console.error('Request data:', error.config?.data)
            console.error('Response data:', error.response?.data)
        }
        return { success: false, message: 'Failed to transplant smart pot' }
    }
}
