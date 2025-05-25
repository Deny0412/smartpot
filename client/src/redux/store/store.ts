import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { initializeWebSocket } from '../slices/measurementsSlice'
import rootReducer from './rootReducer'


export const store = configureStore({
    reducer: rootReducer,
})

// Inicializácia WebSocket služby
initializeWebSocket(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
