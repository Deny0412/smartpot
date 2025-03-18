import { combineReducers } from '@reduxjs/toolkit';
import flowerpotsReducer from '../slices/flowerpotsSlice';
import usersReducer from '../slices/usersSlice';
import householdsReducer from '../slices/householdsSlice';

const rootReducer = combineReducers({
  flowerpots: flowerpotsReducer,
  users: usersReducer,
  households: householdsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;