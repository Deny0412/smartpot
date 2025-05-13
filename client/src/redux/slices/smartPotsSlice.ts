import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SmartPot } from '../../types/flowerTypes'
import {
    disconnectSmartPot as disconnectSmartPotApi,
    loadSmartPots,
    transplantSmartPotToFlower,
    transplantSmartPotWithFlower,
    transplantSmartPotWithoutFlower,
} from '../services/smartPotsApi'
import { RootState } from '../store/rootReducer'

interface SmartPotsState {
    smartPots: SmartPot[]
    inactiveSmartPots: SmartPot[]
    loading: boolean
    error: string | null
    status: string
}

const initialState: SmartPotsState = {
    smartPots: [],
    inactiveSmartPots: [],
    loading: false,
    error: null,
    status: 'idle',
}

export const fetchSmartPots = createAsyncThunk(
    'smartPots/fetchAll',
    async (householdId: string, { rejectWithValue }) => {
        try {
            const response = await loadSmartPots(householdId)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní smart potov')
        }
    },
)

export const disconnectSmartPot = createAsyncThunk(
    'smartPots/disconnectSmartPot',
    async ({ serialNumber, householdId }: { serialNumber: string; householdId: string }, { dispatch }) => {
        try {
       
            const response = await disconnectSmartPotApi(serialNumber, householdId)
          
            return response
        } catch (error) {
           
            throw error
        }
    },
)

export const fetchInactiveSmartPots = createAsyncThunk<SmartPot[], string>(
    'smartPots/fetchInactive',
    async (householdId, { rejectWithValue }) => {
        try {
            const response = await loadSmartPots(householdId)
            return response.filter(pot => pot.active_flower_id === null)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri načítaní neaktívnych smart potov',
            )
        }
    },
)

export const transplantSmartPotToFlowerThunk = createAsyncThunk(
    'smartPots/transplantToFlower',
    async ({ smartPotId, targetFlowerId }: { smartPotId: string; targetFlowerId: string }, { rejectWithValue }) => {
        try {
            return await transplantSmartPotToFlower(smartPotId, targetFlowerId)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetináča k kvetine',
            )
        }
    },
)

export const transplantSmartPotWithFlowerThunk = createAsyncThunk(
    'smartPots/transplantWithFlower',
    async (
        { smartPotId, targetHouseholdId }: { smartPotId: string; targetHouseholdId: string },
        { rejectWithValue },
    ) => {
        try {
            return await transplantSmartPotWithFlower(smartPotId, targetHouseholdId)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetináča s kvetinou',
            )
        }
    },
)

export const transplantSmartPotWithoutFlowerThunk = createAsyncThunk(
    'smartPots/transplantWithoutFlower',
    async (
        {
            smartPotId,
            targetHouseholdId,
            assignOldFlower,
            newFlowerId,
        }: {
            smartPotId: string
            targetHouseholdId: string
            assignOldFlower: boolean
            newFlowerId: string
        },
        { rejectWithValue },
    ) => {
        try {
            return await transplantSmartPotWithoutFlower(smartPotId, targetHouseholdId, assignOldFlower, newFlowerId)
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Chyba pri presadzovaní kvetináča bez kvetiny',
            )
        }
    },
)

const smartPotsSlice = createSlice({
    name: 'smartPots',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
        clearSmartPots: state => {
            state.smartPots = []
            state.inactiveSmartPots = []
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchSmartPots.pending, state => {
                state.loading = true
                state.error = null
                state.smartPots = []
            })
            .addCase(fetchSmartPots.fulfilled, (state, action: PayloadAction<SmartPot[]>) => {
                state.smartPots = action.payload
                state.loading = false
            })
            .addCase(fetchSmartPots.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(disconnectSmartPot.pending, state => {
                state.status = 'loading'
            })
            .addCase(disconnectSmartPot.fulfilled, (state, action) => {
                state.status = 'succeeded'
                const index = state.smartPots.findIndex(pot => pot.serial_number === action.payload.serial_number)
                if (index !== -1) {
                    state.smartPots[index] = action.payload
                }
            })
            .addCase(disconnectSmartPot.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message || 'Failed to disconnect smart pot'
            })

            .addCase(fetchInactiveSmartPots.pending, state => {
                state.loading = true
                state.error = null
                state.inactiveSmartPots = []
            })
            .addCase(fetchInactiveSmartPots.fulfilled, (state, action: PayloadAction<SmartPot[]>) => {
                state.inactiveSmartPots = action.payload
                state.loading = false
            })
            .addCase(fetchInactiveSmartPots.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(transplantSmartPotToFlowerThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantSmartPotToFlowerThunk.fulfilled, (state, action: PayloadAction<SmartPot>) => {
                const index = state.smartPots.findIndex(pot => pot._id === action.payload._id)
                if (index !== -1) {
                    state.smartPots[index] = action.payload
                }
                state.loading = false
            })
            .addCase(transplantSmartPotToFlowerThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(transplantSmartPotWithFlowerThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantSmartPotWithFlowerThunk.fulfilled, (state, action: PayloadAction<SmartPot>) => {
                const index = state.smartPots.findIndex(pot => pot._id === action.payload._id)
                if (index !== -1) {
                    state.smartPots[index] = action.payload
                }
                state.loading = false
            })
            .addCase(transplantSmartPotWithFlowerThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            .addCase(transplantSmartPotWithoutFlowerThunk.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantSmartPotWithoutFlowerThunk.fulfilled, (state, action: PayloadAction<SmartPot>) => {
                const index = state.smartPots.findIndex(pot => pot._id === action.payload._id)
                if (index !== -1) {
                    state.smartPots[index] = action.payload
                }
                state.loading = false
            })
            .addCase(transplantSmartPotWithoutFlowerThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError, clearSmartPots } = smartPotsSlice.actions


export const selectInactiveSmartPots = (state: RootState) => state.smartPots.inactiveSmartPots

export const selectActiveSmartPots = (state: RootState) =>
    state.smartPots.smartPots.filter((pot: SmartPot) => pot.active_flower_id !== null)

export default smartPotsSlice.reducer
