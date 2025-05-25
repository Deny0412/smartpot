import { RootState } from '../store/rootReducer'


export const selectHouseholds = (state: RootState) => state.households.households

export const selectHouseholdsLoading = (state: RootState) => state.households.loading

export const selectHouseholdsError = (state: RootState) => state.households.error


export const selectHouseholdById = (state: RootState, householdId: string) =>
    state.households.households.find(h => h.id === householdId)

export const selectHouseholdName = (state: RootState, householdId: string) => {
    const household = selectHouseholdById(state, householdId)
    return household?.name || ''
}

export const selectIsHouseholdOwner = (state: RootState, householdId: string) => {
    const household = selectHouseholdById(state, householdId)
    return household?.owner === state.auth.user?.id
}

export const selectHouseholdOwner = (state: RootState, householdId: string) => {
    const household = selectHouseholdById(state, householdId)
    return household?.owner
}

export const selectHouseholdMembers = (state: RootState, householdId: string) => {
    const household = selectHouseholdById(state, householdId)
    return household?.members || []
}

export const selectIsHouseholdMember = (state: RootState, householdId: string) => {
    const household = selectHouseholdById(state, householdId)
    return household?.members.includes(state.auth.user?.id || '') || false
}


export const selectUserHouseholds = (state: RootState) => {
    const userId = state.auth.user?.id
    return state.households.households.filter(
        household => household.owner === userId || household.members.includes(userId || ''),
    )
}

export const selectOwnedHouseholds = (state: RootState) => {
    const userId = state.auth.user?.id
    return state.households.households.filter(household => household.owner === userId)
}

export const selectMemberHouseholds = (state: RootState) => {
    const userId = state.auth.user?.id
    return state.households.households.filter(
        household => household.members.includes(userId || '') && household.owner !== userId,
    )
}


export const selectEmptyHouseholds = (state: RootState) => {
    return state.households.households.filter(household => household.members.length === 0)
}


export const selectHouseholdsWithoutFlowers = (state: RootState) => {
    return state.households.households.filter(household => {
        const householdFlowers = state.flowers.flowers.filter(flower => flower.household_id === household.id)
        return householdFlowers.length === 0
    })
}
