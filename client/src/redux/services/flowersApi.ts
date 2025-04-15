import { Flower, FlowerProfile, Schedule, SmartPot } from '../../types/flowerTypes'
import { api } from './api'

export const fetchFlowers = async (): Promise<Flower[]> => {
    const response = await api.get<Flower[]>('/flowers')
    return response.data
}

export const fetchFlowersByHousehold = async (householdId: string): Promise<Flower[]> => {
    const response = await api.get<Flower[]>(`/flowers/household/${householdId}`)
    return response.data
}

export const fetchFlowerDetails = async (flowerId: string): Promise<Flower> => {
    const response = await api.get<Flower>(`/flowers/${flowerId}`)
    return response.data
}

export const addFlower = async (flower: Omit<Flower, 'id'>): Promise<Flower> => {
    const response = await api.post<Flower>('/flowers', flower)
    return response.data
}

export const createFlowerProfile = async (
    profile: Omit<FlowerProfile, 'id' | 'created_at' | 'updated_at'>,
): Promise<FlowerProfile> => {
    const response = await api.post<FlowerProfile>('/flower-profiles', profile)
    return response.data
}

export const deleteFlower = async (id: string): Promise<void> => {
    await api.delete(`/flowers/${id}`)
}

export const fetchFlowerProfiles = async (): Promise<FlowerProfile[]> => {
    const response = await api.get<FlowerProfile[]>(`/flower-profiles/global`)
    return response.data
}

export const fetchSchedules = async (): Promise<Schedule[]> => {
    const response = await api.get<Schedule[]>('/schedules')
    return response.data
}

export const fetchScheduleByFlower = async (flowerId: string): Promise<Schedule> => {
    const response = await api.get<Schedule>(`/schedules/flower/${flowerId}`)
    return response.data
}

export const createSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
    const response = await api.post<Schedule>('/schedules', schedule)
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
    const response = await api.get<SmartPot[]>(`/smart-pots/household/${householdId}`)
    return response.data
}

export const fetchEmptySmartPotsByHousehold = async (householdId: string): Promise<SmartPot[]> => {
    const response = await api.get<SmartPot[]>(`/smart-pots/household/empty/${householdId}`)
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
    const response = await api.put<Flower>(`/flowers/${id}`, flower)
    return response.data
}

export const transplantFlowers = async (flowerIds: string[], targetHouseholdId: string): Promise<Flower[]> => {
    const promises = flowerIds.map(flowerId => updateFlower(flowerId, { household_id: targetHouseholdId }))
    const results = await Promise.all(promises)
    return results
}

export const detachFlower = async (flowerId: string): Promise<void> => {
    await api.put(`/flowers/${flowerId}`, { serial_number: null })
}

export const updateSmartPotFlower = async (serialNumber: string, flowerId: string | null): Promise<SmartPot> => {
    const response = await api.put<SmartPot>('/smart-pots/update', {
        serial_number: serialNumber,
        active_flower_id: flowerId,
    })
    return response.data
}
