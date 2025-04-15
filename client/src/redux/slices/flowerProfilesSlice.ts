import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FlowerProfile } from '../../types/flowerTypes'
import { createFlowerProfile, fetchFlowerProfiles} from '../services/flowersApi'

interface FlowerProfilesState {
    profiles: FlowerProfile[]
    loading: boolean
    error: string | null
}

const initialState: FlowerProfilesState = {
    profiles: [],
    loading: false,
    error: null,
}

export const loadFlowerProfiles = createAsyncThunk('flowerProfiles/load', async () => {
    return await fetchFlowerProfiles()
})

export const createProfile = createAsyncThunk(
    'flowerProfiles/create',
    async (profile: Omit<FlowerProfile, 'id'>, { rejectWithValue }) => {
        try {
            return await createFlowerProfile(profile)
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri vytváraní profilu')
        }
    },
)

const flowerProfilesSlice = createSlice({
    name: 'flowerProfiles',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadFlowerProfiles.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(loadFlowerProfiles.fulfilled, (state, action: PayloadAction<FlowerProfile[]>) => {
                state.profiles = action.payload
                state.loading = false
            })
            .addCase(loadFlowerProfiles.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Chyba pri načítaní profilov'
            })
            .addCase(createProfile.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(createProfile.fulfilled, (state, action: PayloadAction<FlowerProfile>) => {
                state.profiles.push(action.payload)
                state.loading = false
            })
            .addCase(createProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError } = flowerProfilesSlice.actions
export default flowerProfilesSlice.reducer
