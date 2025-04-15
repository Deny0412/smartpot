import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Household } from '../../types/householdTypes'
import { addHousehold, deleteHousehold, fetchHouseholds, updateHousehold } from '../services/householdsApi'

interface HouseholdsState {
    households: Household[]
    loading: boolean
    error: string | null
}

const initialState: HouseholdsState = {
    households: [],
    loading: false,
    error: null,
}

export const loadHouseholds = createAsyncThunk('households/load', async (_, { rejectWithValue }) => {
    try {
        return await fetchHouseholds()
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní domácností')
    }
})

export const createHousehold = createAsyncThunk(
    'households/create',
    async (household: Omit<Household, 'id'>, { rejectWithValue }) => {
        try {
            return await addHousehold(household)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri vytváraní domácnosti')
        }
    },
)

export const removeHousehold = createAsyncThunk('households/delete', async (id: string, { rejectWithValue }) => {
    try {
        await deleteHousehold(id)
        return id
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri mazaní domácnosti')
    }
})

export const updateHouseholdData = createAsyncThunk(
    'households/update',
    async ({ id, data }: { id: string; data: Partial<Household> }, { rejectWithValue }) => {
        try {
            return await updateHousehold(id, data)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri aktualizácii domácnosti')
        }
    },
)

const householdsSlice = createSlice({
    name: 'households',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadHouseholds.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadHouseholds.fulfilled, (state, action: PayloadAction<Household[]>) => {
                state.households = action.payload
                state.loading = false
            })
            .addCase(loadHouseholds.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(createHousehold.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(createHousehold.fulfilled, (state, action: PayloadAction<Household>) => {
                state.households.push(action.payload)
                state.loading = false
            })
            .addCase(createHousehold.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(removeHousehold.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(removeHousehold.fulfilled, (state, action: PayloadAction<string>) => {
                state.households = state.households.filter(household => household.id !== action.payload)
                state.loading = false
            })
            .addCase(removeHousehold.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateHouseholdData.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateHouseholdData.fulfilled, (state, action: PayloadAction<Household>) => {
                const index = state.households.findIndex(h => h.id === action.payload.id)
                if (index !== -1) {
                    state.households[index] = action.payload
                }
                state.loading = false
            })
            .addCase(updateHouseholdData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError } = householdsSlice.actions
export default householdsSlice.reducer
