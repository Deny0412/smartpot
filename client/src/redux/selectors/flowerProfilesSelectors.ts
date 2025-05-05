import { RootState } from '../store/rootReducer'

// Základné selectory
export const selectProfiles = (state: RootState) => state.flowerProfiles.profiles

export const selectProfilesLoading = (state: RootState) => state.flowerProfiles.loading

export const selectProfilesError = (state: RootState) => state.flowerProfiles.error


export const selectProfileById = (state: RootState, profileId: string) =>
    state.flowerProfiles.profiles.find(profile => profile._id === profileId)


export const selectFlowerProfile = (state: RootState, flowerId: string) => {
    const flower = state.flowers.flowers.find(f => f._id === flowerId)
    if (!flower || !flower.profile_id) return null
    return state.flowerProfiles.profiles.find(profile => profile._id === flower.profile_id)
}


export const selectIsValidProfile = (state: RootState, profileId: string) => {
    const profile = selectProfileById(state, profileId)
    if (!profile) return false

    const { temperature, humidity, light } = profile
    return (
        temperature?.min != null &&
        temperature?.max != null &&
        humidity?.min != null &&
        humidity?.max != null &&
        light?.min != null &&
        light?.max != null &&
        temperature.min <= temperature.max &&
        humidity.min <= humidity.max &&
        light.min <= light.max
    )
}


export const selectGlobalProfiles = (state: RootState) =>
    state.flowerProfiles.profiles.filter(profile => profile.is_global)

export const selectCustomProfiles = (state: RootState) =>
    state.flowerProfiles.profiles.filter(profile => !profile.is_global)
