import { api } from './api'

export interface HouseholdInvite {
    id: string
    household_name: string
    inviter_name: string
    timestamp: string
    status: string
}

export const invitesApi = {
    getInvites: async (): Promise<HouseholdInvite[]> => {
        const response = await api.get<{ status: string; data: HouseholdInvite[] }>('/user/invites')
        return response.data.data
    },

    acceptInvite: async (id: string): Promise<void> => {
        await api.put('/household/decision', { id, decision: true })
    },

    rejectInvite: async (id: string): Promise<void> => {
        await api.put('/household/decision', { id, decision: false })
    },
}
