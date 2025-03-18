import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFlowerpots, addFlowerpot, deleteFlowerpot } from '../services/flowerpotsApi';
import { Flowerpot } from '../../types/flowerpotTypes';

interface FlowerpotsState {
  flowerpots: Flowerpot[];
  loading: boolean;
  error: string | null;
}

const initialState: FlowerpotsState = {
  flowerpots: [],
  loading: false,
  error: null,
};

export const loadFlowerpots = createAsyncThunk('flowerpots/load', async () => {
  return await fetchFlowerpots();
});

export const createFlowerpot = createAsyncThunk('flowerpots/create', async (flowerpot: Omit<Flowerpot, 'id'>) => {
  return await addFlowerpot(flowerpot);
});

export const removeFlowerpot = createAsyncThunk('flowerpots/delete', async (id: string) => {
  await deleteFlowerpot(id);
  return id;
});

const flowerpotsSlice = createSlice({
  name: 'flowerpots',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFlowerpots.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFlowerpots.fulfilled, (state, action: PayloadAction<Flowerpot[]>) => {
        state.flowerpots = action.payload;
        state.loading = false;
      })
      .addCase(loadFlowerpots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Chyba pri načítaní kvetináčov';
      })
      .addCase(createFlowerpot.fulfilled, (state, action: PayloadAction<Flowerpot>) => {
        state.flowerpots.push(action.payload);
      })
      .addCase(removeFlowerpot.fulfilled, (state, action: PayloadAction<string>) => {
        state.flowerpots = state.flowerpots.filter((flowerpot) => flowerpot.id !== action.payload);
      });
  },
});

export default flowerpotsSlice.reducer;