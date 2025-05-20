import { AxiosError } from 'axios'
import { MeasurementValue } from '../../types/flowerTypes'
import { api } from './api'

interface MeasurementResponse {
    status: string
    data: MeasurementValue[]
}

export const getMeasurementsForFlower = async (
    flowerId: string,
    householdId: string,
    dateFrom: string,
    dateTo: string,
): Promise<MeasurementResponse> => {
    try {
        const response = await api.post('/measurements/history', {
            id: flowerId,
            householdId,
            dateFrom,
            dateTo,
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                return {
                    status: 'success',
                    data: [],
                }
            }
            throw new Error(error.response?.data?.message || 'Nepodarilo sa získať históriu meraní')
        }
        throw error
    }
}
