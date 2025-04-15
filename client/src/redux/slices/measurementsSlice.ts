import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Measurement } from '../../types/flowerTypes'
import { api } from '../services/api'

interface MeasurementsState {
    measurements: { [key: string]: Measurement[] }
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
    async (flowerId: string, { rejectWithValue }) => {
        try {
            const response = await api.get<Measurement[]>(`/measurements/flower/${flowerId}`)
            return {
                flowerId,
                measurements: response.data,
            }
        } catch (error) {
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
                (state, action: PayloadAction<{ flowerId: string; measurements: Measurement[] }>) => {
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
