import { configureStore } from '@reduxjs/toolkit';
import flowerpotsReducer from '../slices/flowerpotsSlice';
import usersReducer from '../slices/usersSlice';
import householdsReducer from '../slices/householdsSlice';

export const store = configureStore({
  reducer: {
    flowerpots: flowerpotsReducer,
    users: usersReducer,
    households: householdsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;