import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Flower } from '../../types/flowerTypes'
import {
    addFlower,
    deleteFlower,
    detachFlower,
    fetchFlowerDetails,
    fetchFlowersByHousehold,
    transplantFlowers,
    updateFlower,
    updateSmartPotFlower,
} from '../services/flowersApi'

interface FlowersState {
    flowers: Flower[]
    selectedFlower: Flower | null
    loading: boolean
    error: string | null
}

const initialState: FlowersState = {
    flowers: [],
    selectedFlower: null,
    loading: false,
    error: null,
}

export const loadFlowers = createAsyncThunk('flowers/load', async (householdId: string) => {
    return await fetchFlowersByHousehold(householdId)
})

export const loadFlowerDetails = createAsyncThunk<{ status: string; data: Flower }, string>(
    'flowers/loadDetails',
    async (flowerId, { rejectWithValue }) => {
        try {
            const response = await fetchFlowerDetails(flowerId)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní detailov kvetiny')
        }
    },
)

export const createFlower = createAsyncThunk(
    'flowers/create',
    async (flower: Omit<Flower, '_id'>, { rejectWithValue }) => {
        try {
            return await addFlower(flower)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri vytváraní kvetiny')
        }
    },
)

export const removeFlower = createAsyncThunk('flowers/delete', async (id: string) => {
    await deleteFlower(id)
    return id
})

export const updateFlowerData = createAsyncThunk<Flower, { id: string; flower: Partial<Flower> }>(
    'flowers/update',
    async ({ id, flower }, { rejectWithValue }) => {
        try {
            const response = await updateFlower(id, flower)
            return response
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri aktualizácii kvetiny')
        }
    },
)

export const transplantFlowersToHousehold = createAsyncThunk(
    'flowers/transplant',
    async (
        { flowerIds, targetHouseholdId }: { flowerIds: string[]; targetHouseholdId: string },
        { rejectWithValue },
    ) => {
        try {
            return await transplantFlowers(flowerIds, targetHouseholdId)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri presune kvetín')
        }
    },
)

export const detachFlowerFromPot = createAsyncThunk(
    'flowers/detach',
    async ({ flowerId, serialNumber }: { flowerId: string; serialNumber: string }, { rejectWithValue }) => {
        try {
            await detachFlower(flowerId)
            await updateSmartPotFlower(serialNumber, null)
            return flowerId
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri odpájaní kvetiny')
        }
    },
)

export const updateFlowerSmartPot = createAsyncThunk(
    'flowers/updateSmartPot',
    async ({ flowerId, smartPotId }: { flowerId: string; smartPotId: string }, { rejectWithValue }) => {
        try {
            const updatedFlower = await updateFlower(flowerId, { serial_number: smartPotId })
            await updateSmartPotFlower(smartPotId, flowerId)
            return updatedFlower
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri pripájaní kvetiny')
        }
    },
)

const flowersSlice = createSlice({
    name: 'flowers',
    initialState,
    reducers: {
        clearSelectedFlower: state => {
            state.selectedFlower = null
        },
        clearError: state => {
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadFlowers.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadFlowers.fulfilled, (state, action: PayloadAction<Flower[]>) => {
            
                state.flowers = action.payload.map(flower => ({
                    ...flower,
                }))
                state.loading = false
            })
            .addCase(loadFlowers.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Chyba pri načítaní kvetináčov'
            })
            .addCase(loadFlowerDetails.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadFlowerDetails.fulfilled, (state, action: PayloadAction<{ status: string; data: Flower }>) => {
                state.loading = false
                state.selectedFlower = action.payload.data // Uložíme len data z odpovede
            })
            .addCase(loadFlowerDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.selectedFlower = null
            })
            .addCase(createFlower.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(createFlower.fulfilled, (state, action: PayloadAction<Flower>) => {
                state.flowers.push(action.payload)
                state.loading = false
            })
            .addCase(createFlower.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(removeFlower.fulfilled, (state, action: PayloadAction<string>) => {
                state.flowers = state.flowers.filter(flower => flower._id !== action.payload)
                if (state.selectedFlower?._id === action.payload) {
                    state.selectedFlower = null
                }
            })
            .addCase(updateFlowerData.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateFlowerData.fulfilled, (state, action: PayloadAction<Flower>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload._id)
                if (index !== -1) {
                    state.flowers[index] = action.payload
                }
                if (state.selectedFlower?._id === action.payload._id) {
                    state.selectedFlower = action.payload
                }
                state.loading = false
            })
            .addCase(updateFlowerData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(transplantFlowersToHousehold.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(transplantFlowersToHousehold.fulfilled, (state, action: PayloadAction<Flower[]>) => {
                action.payload.forEach(updatedFlower => {
                    const index = state.flowers.findIndex(flower => flower._id === updatedFlower._id)
                    if (index !== -1) {
                        state.flowers[index] = updatedFlower
                    }
                })
                state.loading = false
            })
            .addCase(transplantFlowersToHousehold.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(detachFlowerFromPot.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(detachFlowerFromPot.fulfilled, (state, action: PayloadAction<string>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload)
                if (index !== -1) {
                    state.flowers[index] = { ...state.flowers[index], serial_number: null }
                }
                if (state.selectedFlower?._id === action.payload) {
                    state.selectedFlower = { ...state.selectedFlower, serial_number: null }
                }
                state.loading = false
            })
            .addCase(detachFlowerFromPot.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(updateFlowerSmartPot.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(updateFlowerSmartPot.fulfilled, (state, action: PayloadAction<Flower>) => {
                const index = state.flowers.findIndex(flower => flower._id === action.payload._id)
                if (index !== -1) {
                    state.flowers[index] = action.payload
                }
                if (state.selectedFlower?._id === action.payload._id) {
                    state.selectedFlower = action.payload
                }
                state.loading = false
            })
            .addCase(updateFlowerSmartPot.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearSelectedFlower, clearError } = flowersSlice.actions
export default flowersSlice.reducer
