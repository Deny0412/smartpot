import { CreateHouseholdData, Household } from '../../types/householdTypes'
import { User } from '../../types/userTypes'
import { api } from './api'

interface ApiHousehold extends Household {
    _id?: string
}

interface HouseholdResponse {
    status: string
    data: ApiHousehold[]
}

interface MembersResponse {
    status: string
    data: {
        members: User[]
        invitedMembers: User[]
    }
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

export const inviteMember = async (householdId: string, userId: string): Promise<{ message: string }> => {
    const data = {
        id: householdId,
        invited_user_id: userId,
    }
    console.log('Sending invite request with data:', data)
    const response = await api.post<{ message: string }>('/household/invite', data)
    return response.data
}

export const removeMember = async (householdId: string, memberId: string): Promise<Household> => {
    const response = await api.put<Household>('/household/kick', {
        id: householdId,
        kicked_user_id: memberId,
    })
    return response.data
}

export const makeOwner = async (householdId: string, newOwnerId: string): Promise<Household> => {
    const response = await api.put<Household>('/household/changeOwner', {
        id: householdId,
        new_owner_id: newOwnerId,
    })
    return response.data
}

export const getMembers = async (householdId: string): Promise<MembersResponse> => {
    const response = await api.get<MembersResponse>(`/household/getMembers/${householdId}`)
    return response.data
}
