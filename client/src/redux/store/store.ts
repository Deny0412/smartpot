import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice'
import flowerpotsReducer from '../slices/flowerpotsSlice'
import flowerProfilesReducer from '../slices/flowerProfilesSlice'
import flowersReducer from '../slices/flowersSlice'
import householdsReducer from '../slices/householdsSlice'
import measurementsReducer from '../slices/measurementsSlice'
import usersReducer from '../slices/usersSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        flowers: flowersReducer,
        flowerProfiles: flowerProfilesReducer,
        flowerpots: flowerpotsReducer,
        households: householdsReducer,
        measurements: measurementsReducer,
        users: usersReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['auth/login/fulfilled'],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
