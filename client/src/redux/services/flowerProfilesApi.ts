import { FlowerProfile , Schedule} from '../../types/flowerTypes'
import { api } from './api'

export const flowerProfilesApi = {
    getFlowerProfiles: async (): Promise<FlowerProfile[]> => {
        const response = await api.get<{ status: string; data: FlowerProfile[] }>('/flowerProfile/list')
      
        return response.data.data || []
    },
    getFlowerProfile: async (id: string): Promise<FlowerProfile> => {
        const response = await api.get<{ status: string; data: FlowerProfile }>(`/flowerProfile/get/${id}`)
        return response.data.data
    },
    createFlowerProfile: async (
        profile: Omit<FlowerProfile, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<FlowerProfile> => {
        const response = await api.post<{ status: string; data: FlowerProfile }>('/flowerProfile/create', profile)
        return response.data.data
    },
    updateFlowerProfile: async (
        id: string,
        profile: Partial<Omit<FlowerProfile, 'id' | 'created_at' | 'updated_at'>>,
    ): Promise<FlowerProfile> => {
        const response = await api.put<{ status: string; data: FlowerProfile }>(`/flowerProfile/update`, {
            id,
            ...profile,
        })
        return response.data.data
    },
    deleteFlowerProfile: async (id: string): Promise<void> => {
        await api.delete(`/flowerProfile/delete`, { data: { id } })
    },

    getFlowerSchedule: async (id: string): Promise<Schedule> => {
        const response = await api.get<{ status: string; data: Schedule }>(`/flower/schedule/${id}`)
        return response.data.data
    },
}
