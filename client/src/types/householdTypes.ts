export interface Household {
    id: string
    name: string
    owner: string
    members: string[]
    invites: string[]
}

export interface CreateHouseholdData {
    name: string
    members?: string[]
    invites?: string[]
}
