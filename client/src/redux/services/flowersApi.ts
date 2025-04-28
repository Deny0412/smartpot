import { Flower, FlowerProfile, Schedule, SmartPot } from '../../types/flowerTypes'
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
    await api.delete(`/flower/delete/${id}`)
}

export const fetchFlowerProfiles = async (): Promise<FlowerProfile[]> => {
    const response = await api.get<FlowerProfile[]>(`/flowerProfile/list`)
    return response.data
}

export const fetchScheduleByFlower = async (flowerId: string): Promise<Schedule> => {
    const response = await api.get<Schedule>(`/flower/schedule/${flowerId}`)
 
    return response.data
}

export const createSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
    // Format times to HH:mm and set empty times to null
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

export const transplantFlowers = async (flowerIds: string[], targetHouseholdId: string): Promise<Flower[]> => {
    const promises = flowerIds.map(flowerId => updateFlower(flowerId, { household_id: targetHouseholdId }))
    const results = await Promise.all(promises)
    return results
}

export const detachFlower = async (flowerId: string): Promise<void> => {
    await api.put('/flower/update', { id: flowerId, serial_number: null })
}

export const updateSmartPotFlower = async (serialNumber: string, flowerId: string | null): Promise<SmartPot> => {
    const response = await api.put<SmartPot>('/smart-pot/update', {
        serial_number: serialNumber,
        active_flower_id: flowerId,
    })
    return response.data
}

const updateScheduleByFlower = async (flowerId: string, schedule: Schedule): Promise<Schedule> => {
    const response = await api.put<Schedule>(`/flower/schedule/${flowerId}`, schedule)
    return response.data
}

export { updateScheduleByFlower }
