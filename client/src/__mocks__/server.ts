import { Factory, Model, Response, createServer } from 'miragejs'

export interface HumidityRecord {
    timestamp: Date
    value: number
}

export interface TemperatureRecord {
    timestamp: Date
    value: number
}

export interface LightnessRecord {
    timestamp: Date
    value: number
}

export interface Flowerpot {
    id: string
    name: string
    profile: string
    humidity: number
    history_humidity: HumidityRecord[]
    temperature: number
    history_temperature: TemperatureRecord[]
    light: number
    history_light: LightnessRecord[]
    fullness: number
}

export interface FlowerpotProfile {
    id: string
    name: string
    avatar_img_url: string

    max_humidity: number
    min_humidity: number

    min_temperature: number
    max_temperature: number

    min_light: number
    max_light: number

    irrigation_last: Date

    household_id: string
}

export interface User {
    id: string
    firstname: string
    lastname: string
    email: string
    telnumber: string
    passwordHash: string
    households: Record<string, 'owner' | 'member'>
}

export interface Household {
    id: string
    name: string
    members: string[]
    owner: string
    profiles_ids: string[]
    flowerpots_ids: string[]
}

const avatars = {
    avatar1:
        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
    avatar2:
        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
    avatar3:
        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
    avatar4:
        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308831/flowerpots_avatars/bfsivvzsqjzwig8uqzua.png',
    avatar5:
        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308830/flowerpots_avatars/xwi1ujvpmm2d1magwid8.png',
    avatar6:
        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308825/flowerpots_avatars/emgeoupoglpwkuknuvsi.png',
}

export function makeServer() {
    return createServer({
        models: {
            flowerpot: Model.extend<Partial<Flowerpot>>({}),
            user: Model.extend<Partial<User>>({}),
            household: Model.extend<Partial<Household>>({}),
            profile: Model.extend<Partial<FlowerpotProfile>>({}),
        },

        factories: {
            flowerpot: Factory.extend({
                id(i) {
                    return `flowerpot-${i + 1}`
                },
                name() {
                    return `Kvetináč ${Math.floor(Math.random() * 100)}`
                },
                profile() {
                    return `profile-${Math.floor(Math.random() * 10)}`
                },
                humidity() {
                    return Math.floor(Math.random() * 100)
                },
                temperature() {
                    return Math.floor(Math.random() * 30)
                },
                light() {
                    return Math.floor(Math.random() * 100)
                },
                fullness() {
                    return Math.floor(Math.random() * 100)
                },
                history_humidity() {
                    return []
                },
                history_temperature() {
                    return []
                },
                history_light() {
                    return []
                },
            }),
        },

        seeds(server) {
            server.db.loadData({
                users: [
                    {
                        id: '1',
                        firstname: 'Ján',
                        lastname: 'Novák',
                        email: 'jan@example.com',
                        telnumber: '123456789',
                        passwordHash: 'hash123',
                        households: { 'household-1': 'owner' },
                    },
                ],
                households: [
                    {
                        id: 'household-1',
                        name: 'Rodinný dom',
                        members: ['1'],
                        owner: '1',
                        profiles_ids: ['profile-1'],
                        flowerpots_ids: ['flowerpot-1', 'flowerpot-2'],
                    },
                ],
                flowerpots: [
                    {
                        id: 'flowerpot-1',
                        name: 'Orchidea',
                        profile: 'profile-1',
                        humidity: 60,
                        history_humidity: [],
                        temperature: 22,
                        history_temperature: [],
                        light: 80,
                        history_light: [],
                        fullness: 100,
                    },
                    {
                        id: 'flowerpot-2',
                        name: 'Fikus',
                        profile: 'profile-2',
                        humidity: 55,
                        history_humidity: [],
                        temperature: 21,
                        history_temperature: [],
                        light: 75,
                        history_light: [],
                        fullness: 90,
                    },
                ],
                profiles: [
                    {
                        id: 'profile-1',
                        name: 'Profile 1',
                        avatar_img_url: avatars.avatar1,
                        max_humidity: 70,
                        min_humidity: 50,
                        min_temperature: 20,
                        max_temperature: 25,
                        min_light: 70,
                        max_light: 100,
                        irrigation_last: new Date(),
                        household_id: 'household-1',
                    },
                    {
                        id: 'profile-2',
                        name: 'Fikus',
                        avatar_img_url: avatars.avatar2,
                        max_humidity: 60,
                        min_humidity: 40,
                        min_temperature: 18,
                        max_temperature: 24,
                        min_light: 60,
                        max_light: 90,
                        irrigation_last: new Date(),
                        household_id: 'household-1',
                    },
                ],
            })
        },

        routes() {
            this.namespace = 'api'

            this.get('/flowerpots', schema => {
                return schema.db.flowerpots
            })

            this.post('/flowerpots', (schema, request) => {
                const newFlowerpot = JSON.parse(request.requestBody) as Omit<Flowerpot, 'id'>
                const newId = `flowerpot-${schema.db.flowerpots.length + 1}`

                const createdFlowerpot = schema.db.flowerpots.insert({ id: newId, ...newFlowerpot })
                return new Response(201, {}, createdFlowerpot)
            })

            this.delete('/flowerpots/:id', (schema, request) => {
                const id = request.params.id
                const flowerpot = schema.db.flowerpots.find(id)

                if (flowerpot) {
                    schema.db.flowerpots.remove(id)
                    return new Response(200, {}, { message: 'Kvetináč bol odstránený' })
                } else {
                    return new Response(404, {}, { error: 'Kvetináč nebol nájdený' })
                }
            })

            this.get('/users', schema => {
                return schema.db.users
            })

            this.get('/users/:id', (schema, request) => {
                return schema.db.users.find(request.params.id)
            })

            this.post('/users', (schema, request) => {
                const newUser = JSON.parse(request.requestBody) as Omit<User, 'id'>
                const newId = `user-${schema.db.users.length + 1}`

                const createdUser = schema.db.users.insert({ id: newId, ...newUser })
                return new Response(201, {}, createdUser)
            })

            this.get('/households', schema => {
                return schema.db.households
            })

            this.get('/households/:id', (schema, request) => {
                return schema.db.households.find(request.params.id)
            })

            this.post('/households', (schema, request) => {
                const newHousehold = JSON.parse(request.requestBody) as Omit<Household, 'id'>
                const newId = `household-${schema.db.households.length + 1}`

                const createdHousehold = schema.db.households.insert({ id: newId, ...newHousehold })
                return new Response(201, {}, createdHousehold)
            })
        },
    })
}
