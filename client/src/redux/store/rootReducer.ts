import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice'
import flowerProfilesReducer from '../slices/flowerProfilesSlice'
import flowerpotsReducer from '../slices/flowerpotsSlice'
import flowersReducer from '../slices/flowersSlice'
import householdsReducer from '../slices/householdsSlice'
import measurementsReducer from '../slices/measurementsSlice'
import scheduleReducer from '../slices/scheduleSlice'
import usersReducer from '../slices/usersSlice'
import {
    AuthState,
    FlowerProfilesState,
    FlowerpotsState,
    FlowersState,
    HouseholdsState,
    MeasurementsState,
    ScheduleState,
    UsersState,
} from './types'

export interface RootState {
    auth: AuthState
    flowers: FlowersState
    flowerProfiles: FlowerProfilesState
    flowerpots: FlowerpotsState
    households: HouseholdsState
    measurements: MeasurementsState
    schedule: ScheduleState
    users: UsersState
}

const rootReducer = combineReducers({
    auth: authReducer,
    flowers: flowersReducer,
    flowerProfiles: flowerProfilesReducer,
    flowerpots: flowerpotsReducer,
    households: householdsReducer,
    measurements: measurementsReducer,
    schedule: scheduleReducer,
    users: usersReducer,
})

export default rootReducer
