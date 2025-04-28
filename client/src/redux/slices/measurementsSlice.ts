import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MeasurementType, MeasurementValue } from '../../types/flowerTypes'
import { getMeasurementsForFlower } from '../services/measurmentApi'

interface MeasurementsState {
    measurements: { [key: string]: { [key in MeasurementType]: MeasurementValue[] } }
    loading: boolean
    error: string | null
}

const initialState: MeasurementsState = {
    measurements: {},
    loading: false,
    error: null,
}

export const fetchMeasurementsForFlower = createAsyncThunk(
    'measurements/fetchForFlower',
    async (
        {
            flowerId,
            householdId,
            dateFrom,
            dateTo,
        }: { flowerId: string; householdId: string; dateFrom: string; dateTo: string },
        { rejectWithValue },
    ) => {
        try {
        
            const response = await getMeasurementsForFlower(flowerId, householdId, dateFrom, dateTo)
            

            // Rozdelenie meraní podľa typu
            const measurementsByType = response.data.reduce(
                (acc: { [key in MeasurementType]: MeasurementValue[] }, measurement) => {
                    if (!acc[measurement.type]) {
                        acc[measurement.type] = []
                    }
                    acc[measurement.type].push(measurement)
                    return acc
                },
                {
                    water: [],
                    temperature: [],
                    light: [],
                    humidity: [],
                },
            )

            return {
                flowerId,
                measurements: measurementsByType,
            }
        } catch (error) {
            console.error('Chyba pri načítaní meraní:', error)
            // Ak je to 404 chyba, vrátime prázdne merania
            if (error instanceof Error && error.message.includes('404')) {
                return {
                    flowerId,
                    measurements: {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                    },
                }
            }
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní meraní')
        }
    },
)

const measurementsSlice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        clearMeasurements: state => {
            state.measurements = {}
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchMeasurementsForFlower.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(
                fetchMeasurementsForFlower.fulfilled,
                (
                    state,
                    action: PayloadAction<{
                        flowerId: string
                        measurements: { [key in MeasurementType]: MeasurementValue[] }
                    }>,
                ) => {
                    state.loading = false
                    state.measurements[action.payload.flowerId] = action.payload.measurements
                },
            )
            .addCase(fetchMeasurementsForFlower.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearMeasurements } = measurementsSlice.actions
export default measurementsSlice.reducer
