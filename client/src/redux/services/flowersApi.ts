import { AxiosError } from 'axios'
import { Flower, FlowerProfile, Schedule, SmartPot } from '../../types/flowerTypes'
import { selectFlower } from '../selectors/flowerDetailSelectors'
import { store } from '../store/store'
import { api } from './api'

interface FlowerListResponse {
    status: string
    data: {
        itemList: Flower[]
        pageInfo: {
            total: number
            page: number
            limit: number
        }
    }
}

export const fetchFlowers = async (): Promise<Flower[]> => {
    const response = await api.get<Flower[]>('/flower/list')
    return response.data
}

export const fetchFlowersByHousehold = async (householdId: string): Promise<Flower[]> => {
    const response = await api.get<FlowerListResponse>(`/flower/list?household_id=${householdId}&page=1&limit=100`)

    if (!response.data.data?.itemList) {
        console.error('No itemList in response:', response.data)
        return []
    }
    return response.data.data.itemList.map(flower => ({
        ...flower,
    }))
}

export const fetchFlowerDetails = async (flowerId: string): Promise<{ status: string; data: Flower }> => {
    const response = await api.get<{ status: string; data: Flower }>(`/flower/get/${flowerId}`)
    return response.data
}

export const addFlower = async (flower: Omit<Flower, '_id'>): Promise<Flower> => {
    const response = await api.post<{ status: string; data: Flower }>('/flower/add', flower)

    if (!response.data.data) {
        throw new Error('ID kvetiny nebolo vrátené zo servera')
    }
    return response.data.data
}

export const createFlowerProfile = async (
    profile: Omit<FlowerProfile, 'id' | 'created_at' | 'updated_at'>,
): Promise<FlowerProfile> => {
    const response = await api.post<FlowerProfile>('/api/flower-profiles/create', profile)
    return response.data
}

export const deleteFlower = async (id: string): Promise<void> => {
    const flowerDetails = await fetchFlowerDetails(id)
    const flower = flowerDetails.data

    if (flower.serial_number) {
        
        await updateSmartPot(flower.serial_number, {
            active_flower_id: null,
            household_id: flower.household_id,
        })
        
        await updateFlower(id, { serial_number: '' })
    }

    
    await api.delete(`/flower/delete/${id}`)
}

export const fetchFlowerProfiles = async (): Promise<FlowerProfile[]> => {
    const response = await api.get<FlowerProfile[]>(`/flowerProfile/list`)
    return response.data
}

export const fetchScheduleByFlower = async (flowerId: string): Promise<Schedule> => {
    const response = await api.get<{ status: string; data: Schedule }>(`/flower/getSchedule/${flowerId}`)
    return response.data.data
}

export const createSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
    const formattedSchedule = {
        flower_id: schedule.flower_id,
        active: schedule.active,
        monday: {
            from: schedule.monday?.from || null,
            to: schedule.monday?.to || null,
        },
        tuesday: {
            from: schedule.tuesday?.from || null,
            to: schedule.tuesday?.to || null,
        },
        wednesday: {
            from: schedule.wednesday?.from || null,
            to: schedule.wednesday?.to || null,
        },
        thursday: {
            from: schedule.thursday?.from || null,
            to: schedule.thursday?.to || null,
        },
        friday: {
            from: schedule.friday?.from || null,
            to: schedule.friday?.to || null,
        },
        saturday: {
            from: schedule.saturday?.from || null,
            to: schedule.saturday?.to || null,
        },
        sunday: {
            from: schedule.sunday?.from || null,
            to: schedule.sunday?.to || null,
        },
    }

    const response = await api.post<Schedule>('/schedule/create', formattedSchedule)
    return response.data
}

export const updateSchedule = async (id: string, schedule: Partial<Schedule>): Promise<Schedule> => {
    const response = await api.put<Schedule>(`/schedules/${id}`, schedule)
    return response.data
}

export const fetchSmartPots = async (): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>('/smart-pots')
    return response.data
}

export const fetchSmartPotsByHousehold = async (householdId: string): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>(`/smart-pot/household/${householdId}`)
    return response.data
}

export const fetchEmptySmartPotsByHousehold = async (householdId: string): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>(`/smart-pot/household/empty/${householdId}`)
    return response.data
}

export const createSmartPot = async (smartPot: Omit<SmartPot, 'id'>): Promise<SmartPot> => {
    const response = await api.post<SmartPot>('/smart-pots', smartPot)
    return response.data
}

export const updateSmartPot = async (id: string, smartPot: Partial<SmartPot>): Promise<SmartPot> => {
    const response = await api.put<SmartPot>(`/smart-pots/${id}`, smartPot)
    return response.data
}

export const updateFlower = async (id: string, flower: Partial<Flower>): Promise<Flower> => {
    const response = await api.put<{ status: string; data: Flower }>('/flower/update', { id, ...flower })

    return response.data.data
}

export const transplantFlowerWithSmartPot = async (
    flowerId: string,
    targetHouseholdId: string,
    smartPotId: string,
): Promise<Flower> => {
    try {
        const flowerDetails = await fetchFlowerDetails(flowerId)
        if (!flowerDetails.data.serial_number) {
            throw new Error('Kvetina nemá pripojený smart pot')
        }

        
        const smartPot = await api.get<{ status: string; data: SmartPot }>(
            `/smart-pot/get/${smartPotId}?household_id=${flowerDetails.data.household_id}`,
        )

        if (!smartPot.data.data) {
            throw new Error('Smart pot nebol nájdený')
        }

        const serialNumber = smartPot.data.data.serial_number

        await api.put('/flower/update', {
            id: flowerId,
            serial_number: '',
            household_id: targetHouseholdId,
        })

        await api.put('/smart-pot/update', {
            serial_number: serialNumber,
            active_flower_id: null,
            household_id: targetHouseholdId,
        })

        const response = await api.put<{ status: string; data: Flower }>('/flower/update', {
            id: flowerId,
            serial_number: serialNumber,
            household_id: targetHouseholdId,
        })

        await api.put('/smart-pot/update', {
            serial_number: serialNumber,
            active_flower_id: flowerId,
            household_id: targetHouseholdId,
        })

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

export const transplantFlowerWithoutSmartPot = async (
    flowerId: string,
    targetHouseholdId: string,
    assignOldSmartPot: boolean,
    newFlowerId: string,
): Promise<Flower> => {
    try {
        const flowerDetails = await fetchFlowerDetails(flowerId)
        const serialNumber = flowerDetails.data.serial_number

        if (assignOldSmartPot) {
            await api.put('/smart-pot/update', {
                serial_number: serialNumber,
                household_id: flowerDetails.data.household_id,
                active_flower_id: null,
            })

            await api.put('/flower/update', {
                id: flowerId,
                serial_number: '',
                household_id: targetHouseholdId,
            })

            await api.put('/flower/update', {
                id: newFlowerId,
                serial_number: serialNumber,
                household_id: flowerDetails.data.household_id,
            })

            await api.put('/smart-pot/update', {
                serial_number: serialNumber,
                active_flower_id: newFlowerId,
                household_id: flowerDetails.data.household_id,
            })
        } else {
            if (flowerDetails.data.serial_number) {
                await api.put('/smart-pot/update', {
                    serial_number: serialNumber,
                    household_id: flowerDetails.data.household_id,
                    active_flower_id: null,
                })
            }

            await api.put('/flower/update', {
                id: flowerId,
                serial_number: '',
                household_id: targetHouseholdId,
            })
        }

        const updatedFlower = await fetchFlowerDetails(flowerId)
        return updatedFlower.data
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Request data:', error.config?.data)
            console.error('Response data:', error.response?.data)
        }
        throw error
    }
}

export const transplantFlowerToSmartPot = async (
    flowerId: string,
    targetSmartPotId: string,
    householdId: string,
): Promise<Flower> => {
    try {
        const flowerDetails = await fetchFlowerDetails(flowerId)
        const oldSerialNumber = flowerDetails.data.serial_number

        const smartPot = await api.get<{ status: string; data: SmartPot }>(
            `/smart-pot/get/${targetSmartPotId}?household_id=${householdId}`,
        )
        if (smartPot.data.data.active_flower_id) {
            throw new Error('Smart pot je už pripojený k inej kvetine')
        }

        if (oldSerialNumber) {
            await api.put('/smart-pot/update', {
                serial_number: oldSerialNumber,
                active_flower_id: null,
                household_id: householdId,
            })
        }

        const response = await api.put<{ status: string; data: Flower }>(`/flower/update`, {
            id: flowerId,
            serial_number: smartPot.data.data.serial_number,
        })
        
        await api.put('/smart-pot/update', {
            serial_number: smartPot.data.data.serial_number,
            active_flower_id: flowerId,
            household_id: householdId,
        })

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

export const detachFlower = async (flowerId: string): Promise<void> => {
    try {
        const flowerDetails = selectFlower(store.getState())
        if (!flowerDetails) {
            throw new Error('Flower not found in store')
        }

        const serialNumber = flowerDetails.serial_number

        if (serialNumber) {
            await api.put('/smart-pot/update', {
                serial_number: serialNumber,
                active_flower_id: null,
                household_id: flowerDetails.household_id,
            })
        }
        await api.put('/flower/update', { id: flowerId, serial_number: '' })
    } catch (error) {
        console.error('Error detaching flower:', error)
        throw error
    }
}

export const updateSmartPotFlower = async (serialNumber: string, flowerId: string | null, householdId: string) => {
    const response = await api.put('/smart-pot/update', {
        serial_number: serialNumber,
        active_flower_id: flowerId,
        household_id: householdId,
    })
    return response.data.data
}

const updateScheduleByFlower = async (schedule: Schedule): Promise<Schedule> => {
    const response = await api.put<Schedule>(`/schedule/update`, schedule)
    return response.data
}

export { updateScheduleByFlower }

export const disconnectFlower = async (flowerId: string) => {
    try {
        const response = await updateFlower(flowerId, { serial_number: '' })
        return {
            success: true,
            message: 'Kvetina bola úspešne odpojená',
            data: response,
        }
    } catch (error) {
        console.error('Chyba pri odpojení kvetiny:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Nepodarilo sa odpojiť kvetinu',
        }
    }
}
