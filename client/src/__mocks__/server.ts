import { Factory, Model, createServer } from 'miragejs'

export interface Measurement {
    id: string
    flower_id: string
    temperature: number
    humidity: number
    light: number
    water_level: number
    created_at: string
}

export interface Flower {
    id: string
    name: string
    serial_number: string
    household_id: string
    profile_id: string
    avatar: string
    created_at: string
    updated_at: string
}

export interface FlowerProfile {
    id: string
    name: string
    temperature: {
        min: number
        max: number
    }
    humidity: {
        min: number
        max: number
    }
    light: {
        min: number
        max: number
    }
    created_at: string
    updated_at: string
}

export interface Gateway {
    id: string
    serialNumber: string
    idHousehold: string
    status: 'online' | 'offline'
    lastSync: Date
    connectedDevices: {
        deviceId: string
        status: 'active' | 'inactive'
        lastUpdate: Date
    }[]
}

export interface Household {
    id: string
    name: string
    owner: string
    members: string[]
    invites: string[]
}

export interface User {
    id: string
    name: string
    surname: string
    email: string
    phone: string
    password: string
}

export interface Schedule {
    id: string
    flower_id: string
    active: boolean
    monday: { from: string | null; to: string | null }
    tuesday: { from: string | null; to: string | null }
    wednesday: { from: string | null; to: string | null }
    thursday: { from: string | null; to: string | null }
    friday: { from: string | null; to: string | null }
    saturday: { from: string | null; to: string | null }
    sunday: { from: string | null; to: string | null }
}

export interface SmartPot {
    id: string
    serial_number: string
    household_id: string | null
    active_flower_id: string | null
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

function generateMeasurementsForFlower(flowerId: string): Measurement[] {
    const measurements: Measurement[] = []
    const now = new Date()

    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
        const date = new Date(now)
        date.setDate(date.getDate() - daysAgo)

        for (let hour = 0; hour < 24; hour += 2.4) {
            const measurementTime = new Date(date)
            measurementTime.setHours(hour)
            measurementTime.setMinutes(Math.floor(Math.random() * 60))

            measurements.push({
                id: generateUUID(),
                flower_id: flowerId,
                humidity: 40 + Math.random() * 20,
                temperature: 18 + Math.random() * 5,
                light: 50 + Math.random() * 30,
                water_level: 30 + Math.random() * 40,
                created_at: measurementTime.toISOString(),
            })
        }
    }

    return measurements
}

export function makeServer() {
    return createServer({
        models: {
            measurement: Model.extend<Partial<Measurement>>({}),
            flower: Model.extend<Partial<Flower>>({}),
            flowerProfile: Model.extend<Partial<FlowerProfile>>({}),
            gateway: Model.extend<Partial<Gateway>>({}),
            household: Model.extend<Partial<Household>>({}),
            user: Model.extend<Partial<User>>({}),
            schedule: Model.extend<Partial<Schedule>>({}),
            smartPot: Model.extend<Partial<SmartPot>>({}),
        },

        factories: {
            measurement: Factory.extend({
                humidity() {
                    return 40 + Math.random() * 20
                },
                water_level() {
                    return 30 + Math.random() * 40
                },
                temperature() {
                    return 18 + Math.random() * 5
                },
                light() {
                    return 50 + Math.random() * 30
                },
                timestamp() {
                    return new Date()
                },
            }),
            flower: Factory.extend({
                name() {
                    return `Kvetináč ${Math.floor(Math.random() * 100)}`
                },
                serial_number() {
                    return `SN${Math.floor(Math.random() * 1000)}`
                },
                avatar() {
                    const avatars = [
                        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
                        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
                        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
                        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308831/flowerpots_avatars/bfsivvzsqjzwig8uqzua.png',
                        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308830/flowerpots_avatars/xwi1ujvpmm2d1magwid8.png',
                        'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308825/flowerpots_avatars/emgeoupoglpwkuknuvsi.png',
                    ]
                    return avatars[Math.floor(Math.random() * avatars.length)]
                },
            }),
            flowerProfile: Factory.extend({
                temperature() {
                    return {
                        min: 20,
                        max: 25,
                    }
                },
                humidity() {
                    return {
                        min: 50,
                        max: 70,
                    }
                },
            }),
            gateway: Factory.extend({
                status() {
                    return 'online'
                },
                lastSync() {
                    return new Date()
                },
                connectedDevices() {
                    return []
                },
            }),
            schedule: Factory.extend({
                active() {
                    return false
                },
                monday() {
                    return { from: null, to: null }
                },
                tuesday() {
                    return { from: null, to: null }
                },
                wednesday() {
                    return { from: null, to: null }
                },
                thursday() {
                    return { from: null, to: null }
                },
                friday() {
                    return { from: null, to: null }
                },
                saturday() {
                    return { from: null, to: null }
                },
                sunday() {
                    return { from: null, to: null }
                },
            }),
            smartPot: Factory.extend({
                serial_number() {
                    return `SP${Math.floor(Math.random() * 1000)}`
                },
                household_id() {
                    return 'household-1'
                },
                active_flower_id() {
                    return null
                },
            }),
        },

        seeds(server) {
            server.db.loadData({
                users: [
                    {
                        id: '1',
                        name: 'Test',
                        surname: 'User',
                        email: 'test@test.com',
                        phone: '123456789',
                        password: 'test',
                    },
                    {
                        id: '2',
                        name: 'Test',
                        surname: 'User',
                        email: 'jana@test.com',
                        phone: '987654321',
                        password: 'test',
                    },
                    {
                        id: '3',
                        name: 'Test',
                        surname: 'User',
                        email: 'peter@test.com',
                        phone: '456789123',
                        password: 'test',
                    },
                ],
                households: [
                    {
                        id: 'household-1',
                        name: 'Household 1',
                        owner: '1',
                        members: ['1', '2', '3'],
                        invites: [],
                    },
                    {
                        id: 'household-2',
                        name: 'Household 2',
                        owner: '2',
                        members: ['1', '2'],
                        invites: [],
                    },
                ],
                flowerProfiles: [
                    {
                        id: 'global-1',
                        name: 'Global profil 1',
                        temperature: { min: 20, max: 26 },
                        humidity: { min: 35, max: 55 },
                        light: { min: 65, max: 85 },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    {
                        id: 'global-2',
                        name: 'Global profil 2',
                        temperature: { min: 20, max: 26 },
                        humidity: { min: 35, max: 55 },
                        light: { min: 65, max: 85 },
                    },
                    {
                        id: 'global-3',
                        name: 'Global profil 3',
                        temperature: { min: 20, max: 26 },
                        humidity: { min: 35, max: 55 },
                        light: { min: 65, max: 85 },
                    },
                ],
                flowers: [
                    {
                        id: 'flower-1',
                        name: 'Orchidea',
                        household_id: 'household-1',
                        profile_id: 'global-1',
                        serial_number: 'SN001',
                        avatar: 'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },

                    {
                        id: 'flower-2',
                        name: 'Fikus',
                        household_id: 'household-2',
                        profile_id: '',
                        temperature: { min: 20, max: 26 },
                        humidity: { min: 35, max: 55 },
                        light: { min: 65, max: 85 },
                        serial_number: 'SN002',
                        avatar: 'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    {
                        id: 'flower-3',
                        name: 'Monstera',
                        household_id: 'household-1',
                        profile_id: 'global-3',
                        serial_number: '',
                        avatar: 'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ],
                measurements: [
                    ...generateMeasurementsForFlower('flower-1'),
                    ...generateMeasurementsForFlower('flower-2'),
                    ...generateMeasurementsForFlower('flower-3'),
                    ...generateMeasurementsForFlower('flower-4'),
                ],
                gateways: [
                    {
                        id: 'gateway-1',
                        serialNumber: 'GW001',
                        idHousehold: 'household-1',
                        status: 'online',
                        lastSync: new Date(),
                        connectedDevices: [
                            {
                                deviceId: 'flower-1',
                                status: 'active',
                                lastUpdate: new Date(),
                            },
                        ],
                    },
                ],
                schedules: [
                    {
                        id: 'schedule-1',
                        flower_id: 'flower-1',
                        active: true,
                        monday: { from: '08:00', to: '20:00' },
                        tuesday: { from: '08:00', to: '20:00' },
                        wednesday: { from: '08:00', to: '20:00' },
                        thursday: { from: '08:00', to: '20:00' },
                        friday: { from: '08:00', to: '20:00' },
                        saturday: { from: null, to: null },
                        sunday: { from: null, to: null },
                    },
                ],
                smartPots: [
                    {
                        id: 'smartpot-1',
                        serial_number: 'SN001',
                        household_id: 'household-1',
                        active_flower_id: 'flower-1',
                    },
                    {
                        id: 'smartpot-2',
                        serial_number: 'SN002',
                        household_id: 'household-2',
                        active_flower_id: 'flower-2',
                    },
                    {
                        id: 'smartpot-3',
                        serial_number: 'SN003',
                        household_id: 'household-1',
                        active_flower_id: 'flower-3',
                    },
                    {
                        id: 'smartpot-4',
                        serial_number: 'SN004',
                        household_id: 'household-1',
                        active_flower_id: 'flower-4',
                    },
                    {
                        id: 'smartpot-5',
                        serial_number: 'SN005',
                        household_id: 'household-1',
                        active_flower_id: null,
                    },
                    {
                        id: 'smartpot-6',
                        serial_number: 'SN006',
                        household_id: 'household-1',
                        active_flower_id: null,
                    },
                ],
            })
        },

        routes() {
            this.namespace = 'api'

            const authMiddleware = (request: any) => {
                const authHeader = request.requestHeaders.Authorization
                if (request.url === '/api/users' && !authHeader) {
                    return null
                }
                if (!authHeader) {
                    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 })
                }

                const token = authHeader.split(' ')[1]
                if (!token) {
                    return new Response(JSON.stringify({ error: 'Invalid Authorization header format' }), {
                        status: 401,
                    })
                }
                return null
            }

            this.get('/users/batch', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) {
                    return authResponse
                }

                const ids = request.queryParams.ids

                const userIds = typeof ids === 'string' ? ids.split(',') : []

                const allUsers = schema.db.users

                const filteredUsers = allUsers.filter((user: { id: string }) => userIds.includes(user.id))

                const usersObject: { [key: string]: any } = {}
                filteredUsers.forEach((user: any) => {
                    usersObject[user.id] = user
                })

                return usersObject
            })

            this.get('/users', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                const users = schema.db.users

                return {
                    users: Object.values(users),
                }
            })

            this.get('/users/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.users.find(request.params.id)
            })

            this.get('/households', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse

                const authHeader = request.requestHeaders.Authorization
                const token = authHeader.split(' ')[1]

                const households = schema.db.households

                return households
            })

            this.get('/households/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.households.find(request.params.id)
            })

            this.post('/households', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                const household = JSON.parse(request.requestBody)
                const newHousehold = {
                    id: `household-${schema.db.households.length + 1}`,
                    ...household,
                }
                schema.db.households.push(newHousehold)
                return newHousehold
            })

            this.get('/flowers', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.flowers
            })

            this.get('/flowers/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                const flower = schema.db.flowers.find(request.params.id)
                return flower
            })

            this.get('/flowers/household/:householdId', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                const flowers = schema.db.flowers.where({ household_id: request.params.householdId })
                return flowers
            })

            this.get('/flower-profiles', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.flowerProfiles
            })

            this.get('/flower-profiles/global', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.flowerProfiles.where((profile: { id: string }) => profile.id.startsWith('global'))
            })

            this.get('/flower-profiles/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.flowerProfiles.find(request.params.id)
            })

            this.get('/flower-profiles/household/:householdId', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse

                const profiles = schema.db.flowerProfiles.where({ household_id: request.params.householdId })

                return profiles
            })

            this.get('/measurements', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.measurements
            })

            this.get('/measurements/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.measurements.find(request.params.id)
            })

            this.get('/measurements/flower/:flowerId', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                const measurements = schema.db.measurements.where({ flower_id: request.params.flowerId })

                return measurements
            })

            this.get('/gateways', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.gateways
            })

            this.get('/gateways/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.gateways.find(request.params.id)
            })

            this.get('/schedules', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.schedules
            })

            this.get('/schedules/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.schedules.find(request.params.id)
            })

            this.get('/schedules/flower/:flowerId', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                const schedules = schema.db.schedules.where({ flower_id: request.params.flowerId })
                return (
                    schedules[0] || {
                        id: `schedule-${request.params.flowerId}`,
                        flower_id: request.params.flowerId,
                        active: false,
                        monday: { from: null, to: null },
                        tuesday: { from: null, to: null },
                        wednesday: { from: null, to: null },
                        thursday: { from: null, to: null },
                        friday: { from: null, to: null },
                        saturday: { from: null, to: null },
                        sunday: { from: null, to: null },
                    }
                )
            })

            this.get('/smart-pots', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.smartPots
            })

            this.get('/smart-pots/:id', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.smartPots.find(request.params.id)
            })

            this.get('/smart-pots/household/:householdId', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.smartPots.where({ household_id: request.params.householdId })
            })

            this.get('/smart-pots/household/empty/:householdId', (schema, request) => {
                const authResponse = authMiddleware(request)
                if (authResponse) return authResponse
                return schema.db.smartPots.where({
                    household_id: request.params.householdId,
                    active_flower_id: null,
                })
            })
        },
    })
}
