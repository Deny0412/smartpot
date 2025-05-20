import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Schedule } from '../../types/flowerTypes'
import { fetchScheduleByFlower, updateScheduleByFlower } from '../services/flowersApi'

interface ScheduleState {
    schedule: Schedule | null
    loading: boolean
    error: string | null
}

const initialState: ScheduleState = {
    schedule: null,
    loading: false,
    error: null,
}

export const loadSchedule = createAsyncThunk('schedule/load', async (flowerId: string, { rejectWithValue }) => {
    try {
        const response = await fetchScheduleByFlower(flowerId)
        return response
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní rozvrhu')
    }
})

export const updateSchedule = createAsyncThunk(
    'schedule/updateSchedule',
    async ({ flowerId, schedule }: { flowerId: string; schedule: Schedule }) => {
        const response = await updateScheduleByFlower(flowerId, schedule)
        return response
    },
)

const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        clearSchedule: state => {
            state.schedule = null
        },
        clearError: state => {
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadSchedule.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadSchedule.fulfilled, (state, action: PayloadAction<Schedule>) => {
                state.loading = false
                state.schedule = action.payload
            })
            .addCase(loadSchedule.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateSchedule.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateSchedule.fulfilled, (state, action) => {
                state.loading = false
                state.schedule = action.payload
            })
            .addCase(updateSchedule.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Chyba pri aktualizácii rozvrhu'
            })
    },
})

export const { clearSchedule, clearError } = scheduleSlice.actions
export default scheduleSlice.reducer
