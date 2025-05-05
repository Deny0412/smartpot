import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CreateHouseholdData, Household } from '../../types/householdTypes'
import {
    addHousehold,
    deleteHousehold,
    fetchHouseholds,
    inviteMember,
    leaveHousehold,
    makeOwner,
    removeMember,
    updateHousehold,
} from '../services/householdsApi'

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

interface HouseholdResponse {
    status: string
    data: Household[]
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
    async (data: CreateHouseholdData, { rejectWithValue }) => {
        try {
            return await addHousehold(data)
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

export const leaveHouseholdAction = createAsyncThunk('households/leave', async (id: string, { rejectWithValue }) => {
    try {
        await leaveHousehold(id)
        return id
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri opustení domácnosti')
    }
})

export const inviteMemberAction = createAsyncThunk(
    'households/invite',
    async ({ householdId, userId }: { householdId: string; userId: string }, { rejectWithValue }) => {
        try {
            return await inviteMember(householdId, userId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri pozvaní člena')
        }
    },
)

export const removeMemberAction = createAsyncThunk(
    'households/removeMember',
    async ({ householdId, memberId }: { householdId: string; memberId: string }, { rejectWithValue }) => {
        try {
            return await removeMember(householdId, memberId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri odstránení člena')
        }
    },
)

export const makeOwnerAction = createAsyncThunk(
    'households/makeOwner',
    async ({ householdId, newOwnerId }: { householdId: string; newOwnerId: string }, { rejectWithValue }) => {
        try {
            return await makeOwner(householdId, newOwnerId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri zmene vlastníka')
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
            .addCase(loadHouseholds.fulfilled, (state, action: PayloadAction<HouseholdResponse>) => {
                state.households = action.payload.data
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
                    state.households[index] = {
                        ...state.households[index],
                        ...action.payload,
                    }
                }
                state.loading = false
                state.error = null
            })
            .addCase(updateHouseholdData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(leaveHouseholdAction.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(leaveHouseholdAction.fulfilled, (state, action: PayloadAction<string>) => {
                state.households = state.households.filter(household => household.id !== action.payload)
                state.loading = false
            })
            .addCase(leaveHouseholdAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(inviteMemberAction.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(inviteMemberAction.fulfilled, state => {
                state.loading = false
                state.error = null
            })
            .addCase(inviteMemberAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(removeMemberAction.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(removeMemberAction.fulfilled, (state, action: PayloadAction<Household>) => {
                const index = state.households.findIndex(h => h.id === action.payload.id)
                if (index !== -1) {
                    state.households[index] = action.payload
                }
                state.loading = false
            })
            .addCase(removeMemberAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(makeOwnerAction.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(makeOwnerAction.fulfilled, (state, action: PayloadAction<Household>) => {
                const index = state.households.findIndex(h => h.id === action.payload.id)
                if (index !== -1) {
                    state.households[index] = action.payload
                }
                state.loading = false
            })
            .addCase(makeOwnerAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError } = householdsSlice.actions
export default householdsSlice.reducer
