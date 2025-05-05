import { SmartPot } from '../../types/flowerTypes'
import { RootState } from '../store/rootReducer'

// Selektory
export const selectSmartPots = (state: RootState) => state.smartPots.smartPots

export const selectInactiveSmartPots = (state: RootState) =>
    state.smartPots.smartPots.filter((pot: SmartPot) => pot.active_flower_id === null)

export const selectActiveSmartPots = (state: RootState) =>
    state.smartPots.smartPots.filter((pot: SmartPot) => pot.active_flower_id !== null)

export const selectAllSmartPots = (state: RootState) => [
    ...state.smartPots.smartPots,
    ...state.smartPots.inactiveSmartPots,
]
