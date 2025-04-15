import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice'
import flowerProfilesReducer from '../slices/flowerProfilesSlice'
import flowerpotsReducer from '../slices/flowerpotsSlice'
import flowersReducer from '../slices/flowersSlice'
import householdsReducer from '../slices/householdsSlice'
import measurementsReducer from '../slices/measurementsSlice'
import usersReducer from '../slices/usersSlice'

const rootReducer = combineReducers({
    auth: authReducer,
    flowers: flowersReducer,
    flowerProfiles: flowerProfilesReducer,
    flowerpots: flowerpotsReducer,
    households: householdsReducer,
    measurements: measurementsReducer,
    users: usersReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
