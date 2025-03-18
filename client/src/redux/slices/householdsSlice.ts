

  import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
  import { Household } from '../../types/householdTypes';
  import { fetchHouseholds, addHousehold, deleteHousehold } from '../services/householdsApi';
  
  interface HouseholdsState {
    households: Household[];
    loading: boolean;
    error: string | null;
  }
  
  const initialState: HouseholdsState = {
    households: [],
    loading: false,
    error: null,
  };
  
  export const loadHouseholds = createAsyncThunk('households/load', async () => {
    return await fetchHouseholds();
  });
  
  export const createHousehold = createAsyncThunk('households/create', async (household: Omit<Household, 'id'>) => {
    return await addHousehold(household);
  });
  
  export const removeHousehold = createAsyncThunk('households/delete', async (id: string) => {
    await deleteHousehold(id);
    return id;
  });
  
  const householdsSlice = createSlice({
    name: 'households',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(loadHouseholds.pending, (state) => {
          state.loading = true;
        })
        .addCase(loadHouseholds.fulfilled, (state, action: PayloadAction<Household[]>) => {
          state.households = action.payload;
          state.loading = false;
        })
        .addCase(loadHouseholds.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Chyba pri načítaní domácností';
        })
        .addCase(createHousehold.fulfilled, (state, action: PayloadAction<Household>) => {
          state.households.push(action.payload);
        })
        .addCase(removeHousehold.fulfilled, (state, action: PayloadAction<string>) => {
          state.households = state.households.filter((household) => household.id !== action.payload);
        });
    },
  });
  
  export default householdsSlice.reducer;
  