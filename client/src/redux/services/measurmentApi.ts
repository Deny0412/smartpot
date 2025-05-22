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
    typeOfData: 'water' | 'humidity' | 'temperature' | 'light' | 'battery',
): Promise<MeasurementResponse> => {
    try {
        const requestBody = {
            id: flowerId,
            typeOfData,
            dateFrom,
            dateTo,
        }

        const response = await api.post('/flower/history', requestBody)

        return response.data
    } catch (error) {
        console.error('Error fetching measurements:', error)
        throw error
    }
}
