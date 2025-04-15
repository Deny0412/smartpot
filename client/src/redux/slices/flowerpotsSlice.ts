import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SmartPot } from '../../types/flowerTypes'
import { flowerpotsApi } from '../services/flowerpotsApi'

interface FlowerpotsState {
    flowerpots: SmartPot[]
    inactiveFlowerpots: SmartPot[]
    loading: boolean
    error: string | null
}

const initialState: FlowerpotsState = {
    flowerpots: [],
    inactiveFlowerpots: [],
    loading: false,
    error: null,
}

export const loadFlowerpots = createAsyncThunk('flowerpots/load', async (householdId: string, { rejectWithValue }) => {
    try {
        const flowerpots = await flowerpotsApi.getHouseholdSmartPots(householdId)
        return flowerpots
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní kvetináčov')
    }
})

export const loadInactiveFlowerpots = createAsyncThunk(
    'flowerpots/loadInactive',
    async (householdId: string, { rejectWithValue }) => {
        try {
            const flowerpots = await flowerpotsApi.getInactiveHouseholdSmartPots(householdId)
            return flowerpots
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní neaktívnych kvetináčov')
        }
    },
)

const flowerpotsSlice = createSlice({
    name: 'flowerpots',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadFlowerpots.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadFlowerpots.fulfilled, (state, action: PayloadAction<SmartPot[]>) => {
                state.flowerpots = action.payload
                state.loading = false
            })
            .addCase(loadFlowerpots.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(loadInactiveFlowerpots.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadInactiveFlowerpots.fulfilled, (state, action: PayloadAction<SmartPot[]>) => {
                state.inactiveFlowerpots = action.payload
                state.loading = false
            })
            .addCase(loadInactiveFlowerpots.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError } = flowerpotsSlice.actions
export default flowerpotsSlice.reducer
