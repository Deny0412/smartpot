import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import i18next from 'i18next'
import { MeasurementType, MeasurementValue } from '../../types/flowerTypes'
import { api } from '../services/api'
import { getMeasurementsForFlower } from '../services/measurmentApi'
import { AppDispatch } from '../store/store'

const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
} as const

export type WebSocketConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
    | 'error'
    | 'closing'

export interface MeasurementsByType {
    water: MeasurementValue[]
    temperature: MeasurementValue[]
    light: MeasurementValue[]
    humidity: MeasurementValue[]
    battery: MeasurementValue[]
}

export interface Measurements extends MeasurementsByType {
    lastChange: string
}

export interface MeasurementsState {
    measurements: {
        [flowerId: string]: Measurements
    }
    loading: boolean
    error: string | null
    activeWebSocketFlowerId: string | null
    webSocketStatus: WebSocketConnectionStatus // Nový stav pre WebSocket
    lastChange: {
        flowerId: string
        type: MeasurementType
        timestamp: string
    } | null
}

const initialState: MeasurementsState = {
    measurements: {},
    loading: false,
    error: null,
    activeWebSocketFlowerId: null,
    webSocketStatus: 'idle', // Počiatočný stav pre WebSocket
    lastChange: null,
}

// WebSocket service
class WebSocketService {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectTimeout = 3000
    private flowerId: string | null = null
    private token: string | null = null
    private dispatch: AppDispatch | null = null // Upravený typ pre dispatch
    private isIntentionalDisconnect = false

    constructor() {
        this.token = localStorage.getItem('token')
    }

    setDispatch(dispatch: AppDispatch) {
        this.dispatch = dispatch
    }

    prepareForIntentionalDisconnect() {
        this.isIntentionalDisconnect = true
    }

    connect(flowerId: string) {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            if (this.flowerId === flowerId && this.ws.readyState === WebSocket.OPEN) {
                console.log(i18next.t('flower_detail.console.websocket_already_connected_open', { flowerId }))
                if (this.dispatch) this.dispatch(measurementsSlice.actions.setWebSocketStatus('connected'))
                return
            }
            console.log(
                i18next.t('flower_detail.console.websocket_closing_existing_before_new', {
                    state: this.ws.readyState,
                    flowerId,
                }),
            )
            this.ws.onclose = null
            this.ws.close()
            this.ws = null
        }

        this.flowerId = flowerId
        this.isIntentionalDisconnect = false
        this.reconnectAttempts = 0

        // Aktualizujeme token pred každým pripojením
        this.token = localStorage.getItem('token')
        if (!this.token) {
            console.error(i18next.t('flower_detail.console.token_not_available'))
            return
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const hostname = window.location.hostname
        const port = '3001'
        const wsUrl = `${protocol}//${hostname}:${port}/ws/measurements/${flowerId}?token=${this.token}`

        try {
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log(i18next.t('flower_detail.console.websocket_open_for_flower', { flowerId: this.flowerId }))
                this.reconnectAttempts = 0
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connected'))
                    this.dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(this.flowerId!))

                    setTimeout(() => {
                        this.sendMessage({ type: 'get_measurements' })
                    }, 1000)
                }
            }

            this.ws.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)

                    if (!this.dispatch || !this.flowerId) {
                        return
                    }

                    switch (message.type) {
                        case 'connection':
                            this.sendMessage({ type: 'get_measurements' })
                            break
                        case 'measurements':
                            this.dispatch(
                                measurementsSlice.actions.setMeasurements({
                                    flowerId: this.flowerId,
                                    measurements: message.data,
                                }),
                            )
                            break
                        case 'measurement_inserted':
                            if (
                                !message.data.type ||
                                !['water', 'temperature', 'light', 'humidity', 'battery'].includes(message.data.type)
                            ) {
                                break
                            }

                            const measurementWithType = {
                                ...message.data,
                                type: message.data.type,
                            }

                            this.dispatch(
                                measurementsSlice.actions.addMeasurement({
                                    flowerId: this.flowerId,
                                    measurement: measurementWithType,
                                }),
                            )

                            break
                        case 'measurement_updated':
                            this.dispatch(
                                measurementsSlice.actions.updateMeasurement({
                                    flowerId: this.flowerId,
                                    measurement: message.data,
                                }),
                            )
                            break
                        case 'measurement_deleted':
                            this.dispatch(
                                measurementsSlice.actions.removeMeasurement({
                                    flowerId: this.flowerId,
                                    type: message.data.type,
                                    measurementId: message.data.measurement_id,
                                }),
                            )
                            break
                        case 'error':
                            break
                        default:
                    }
                } catch (error) {}
            }

            this.ws.onclose = event => {
                if (this.isIntentionalDisconnect) {
                    if (this.dispatch) {
                        this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                        this.dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(null))
                    }
                    this.isIntentionalDisconnect = false
                } else {
                    this.handleReconnect()
                }
                this.ws = null
            }

            this.ws.onerror = error => {
                console.error(
                    i18next.t('flower_detail.console.websocket_error_for_flower', { flowerId: this.flowerId }),
                    error,
                )
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
                }
                this.handleReconnect()
            }
        } catch (error) {
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            this.handleReconnect()
        }
    }

    private handleReconnect() {
        if (this.isIntentionalDisconnect) {
            return
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++

            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('reconnecting'))
            }
            setTimeout(() => {
                if (this.flowerId && !this.isIntentionalDisconnect) {
                    console.log(
                        i18next.t('flower_detail.console.websocket_reconnecting_to_flower', {
                            flowerId: this.flowerId,
                        }),
                    )
                    if (this.dispatch) this.dispatch(measurementsSlice.actions.setWebSocketStatus('connecting'))
                    this.connect(this.flowerId)
                }
            }, this.reconnectTimeout)
        } else {
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('disconnected'))
                this.dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(null))
            }
        }
    }

    sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        }
    }

    disconnect() {
        // isIntentionalDisconnect by mal byť nastavený cez prepareForIntentionalDisconnect
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close()
            } else {
                if (this.isIntentionalDisconnect && this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                    this.dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(null))
                    this.isIntentionalDisconnect = false
                }
            }
            this.ws = null
        } else {
            if (this.isIntentionalDisconnect && this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                this.dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(null))
                this.isIntentionalDisconnect = false
            }
        }
    }
}

export const webSocketService = new WebSocketService()

export const fetchMeasurementsForFlower = createAsyncThunk(
    'measurements/fetchForFlower',
    async (
        {
            flowerId,
            householdId,
            dateFrom,
            dateTo,
        }: { flowerId: string; householdId: string; dateFrom: string; dateTo: string },
        { rejectWithValue },
    ) => {
        try {
            const response = await getMeasurementsForFlower(flowerId, householdId, dateFrom, dateTo)

            const measurementsByType = response.data.reduce(
                (acc: MeasurementsByType, measurement) => {
                    if (!acc[measurement.type]) {
                        acc[measurement.type] = []
                    }

                    acc[measurement.type].push(measurement)
                    acc[measurement.type].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    )
                    return acc
                },
                {
                    water: [],
                    temperature: [],
                    light: [],
                    humidity: [],
                    battery: [],
                } as MeasurementsByType,
            )

            return {
                flowerId,
                measurements: measurementsByType,
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return {
                    flowerId,
                    measurements: {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                        battery: [],
                    } as MeasurementsByType,
                }
            }
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní meraní')
        }
    },
)

export const fetchLatestMeasurements = createAsyncThunk(
    'measurements/fetchLatest',
    async ({ flowerId, householdId }: { flowerId: string; householdId: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/measurements/latest', {
                id: flowerId,
                householdId,
            })
            return response.data.data
        } catch (error: any) {
            if (error.response?.status === 404) {
                return {
                    water: null,
                    humidity: null,
                    light: null,
                    temperature: null,
                    battery: null,
                }
            }
            return rejectWithValue(error.message || 'Chyba pri načítaní meraní')
        }
    },
)

export const measurementsSlice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        setWebSocketStatus: (state, action: PayloadAction<WebSocketConnectionStatus>) => {
            state.webSocketStatus = action.payload
        },
        clearMeasurements: state => {
            state.measurements = {}
        },
        startWebSocketConnection: (state, action: PayloadAction<string>) => {
            if (
                state.activeWebSocketFlowerId !== action.payload ||
                ['idle', 'disconnected', 'error', 'closing'].includes(state.webSocketStatus)
            ) {
                if (
                    state.activeWebSocketFlowerId &&
                    state.activeWebSocketFlowerId !== action.payload &&
                    !['idle', 'disconnected', 'error', 'closing'].includes(state.webSocketStatus)
                ) {
                    console.log(
                        i18next.t('flower_detail.console.websocket_switching_flower', {
                            oldFlowerId: state.activeWebSocketFlowerId,
                            newFlowerId: action.payload,
                        }),
                    )
                    webSocketService.prepareForIntentionalDisconnect()
                    webSocketService.disconnect()
                }

                state.activeWebSocketFlowerId = action.payload
                state.webSocketStatus = 'connecting'
                webSocketService.connect(action.payload)
            } else if (state.activeWebSocketFlowerId === action.payload && state.webSocketStatus === 'connected') {
                console.log(
                    i18next.t('flower_detail.console.websocket_already_connected_to_flower', {
                        flowerId: action.payload,
                    }),
                )
            }
        },
        stopWebSocketConnection: state => {
            if (
                state.activeWebSocketFlowerId &&
                state.webSocketStatus !== 'idle' &&
                state.webSocketStatus !== 'closing'
            ) {
                console.log(
                    i18next.t('flower_detail.console.websocket_stopping_connection_for_flower', {
                        flowerId: state.activeWebSocketFlowerId,
                    }),
                )
                state.webSocketStatus = 'closing'
                webSocketService.prepareForIntentionalDisconnect()
                webSocketService.disconnect()
            } else {
                console.log(
                    i18next.t('flower_detail.console.websocket_stop_called_on_inactive', {
                        status: state.webSocketStatus,
                    }),
                )
                state.activeWebSocketFlowerId = null // Ensure cleanup
                state.webSocketStatus = 'idle' // Ensure cleanup
            }
        },
        setMeasurements: (state, action: PayloadAction<{ flowerId: string; measurements: Measurements }>) => {
            const { flowerId, measurements } = action.payload
            const initialMeasurements: Measurements = {
                water: [],
                temperature: [],
                light: [],
                humidity: [],
                battery: [],
                lastChange: new Date().toISOString(),
            }

            if (!state.measurements[flowerId]) {
                state.measurements[flowerId] = initialMeasurements
            }

            Object.entries(measurements).forEach(([type, values]) => {
                if (type in state.measurements[flowerId]) {
                    state.measurements[flowerId][type as keyof Omit<Measurements, 'lastChange'>] = values
                }
            })

            state.measurements[flowerId].lastChange = new Date().toISOString()
        },
        addMeasurement: (state, action: PayloadAction<{ flowerId: string; measurement: MeasurementValue }>) => {
            const { flowerId, measurement } = action.payload

            const validTypes = ['water', 'temperature', 'light', 'humidity', 'battery'] as const
            type ValidType = (typeof validTypes)[number]

            if (!measurement.type || !validTypes.includes(measurement.type as ValidType)) {
                return
            }

            const measurementType = measurement.type as ValidType

            if (!state.measurements[flowerId]) {
                state.measurements[flowerId] = {
                    water: [],
                    temperature: [],
                    light: [],
                    humidity: [],
                    battery: [],
                    lastChange: new Date().toISOString(),
                }
            }

            const measurements = state.measurements[flowerId][measurementType]

            const isDuplicate = measurements.some((m: MeasurementValue) => m._id === measurement._id)
            if (isDuplicate) {
                return
            }

            measurements.unshift(measurement)

            if (measurements.length > 1000) {
                measurements.length = 1000
            }

            state.measurements[flowerId].lastChange = new Date().toISOString()
        },
        updateMeasurement: (state, action: PayloadAction<{ flowerId: string; measurement: MeasurementValue }>) => {
            const { flowerId, measurement } = action.payload
            const validTypes = ['water', 'temperature', 'light', 'humidity', 'battery'] as const
            type ValidType = (typeof validTypes)[number]

            if (
                state.measurements[flowerId] &&
                measurement.type &&
                validTypes.includes(measurement.type as ValidType)
            ) {
                const measurementType = measurement.type as ValidType
                const index = state.measurements[flowerId][measurementType].findIndex(
                    (m: MeasurementValue) => m._id === measurement._id,
                )
                if (index !== -1) {
                    state.measurements[flowerId][measurementType][index] = measurement
                    state.measurements[flowerId].lastChange = new Date().toISOString()
                }
            }
        },
        removeMeasurement: (
            state,
            action: PayloadAction<{ flowerId: string; type: MeasurementType; measurementId: string }>,
        ) => {
            const { flowerId, type, measurementId } = action.payload
            const validTypes = ['water', 'temperature', 'light', 'humidity', 'battery'] as const
            type ValidType = (typeof validTypes)[number]

            if (state.measurements[flowerId] && validTypes.includes(type as ValidType)) {
                const measurementType = type as ValidType
                state.measurements[flowerId][measurementType] = state.measurements[flowerId][measurementType].filter(
                    (m: MeasurementValue) => m._id !== measurementId,
                )
                state.measurements[flowerId].lastChange = new Date().toISOString()
            }
        },
        setActiveWebSocketFlowerId: (state, action: PayloadAction<string | null>) => {
            state.activeWebSocketFlowerId = action.payload
        },
        clearActiveWebSocketFlowerId: state => {
            state.activeWebSocketFlowerId = null
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchMeasurementsForFlower.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMeasurementsForFlower.fulfilled, (state, action) => {
                state.loading = false
                const { flowerId, measurements: newMeasurementsByType } = action.payload

                // Inicializuj stav pre kvetinu ak neexistuje
                if (!state.measurements[flowerId]) {
                    state.measurements[flowerId] = {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                        battery: [],
                        lastChange: new Date().toISOString(),
                    }
                }

                const existingMeasurements = state.measurements[flowerId]
                let changed = false

                // Prejdi všetky typy meraní a zlúč ich
                ;(Object.keys(newMeasurementsByType) as Array<keyof MeasurementsByType>).forEach(type => {
                    const existing = existingMeasurements[type] || []
                    const newlyFetched = newMeasurementsByType[type] || []

                    if (newlyFetched.length > 0) {
                        changed = true // Označ, že prišli nové dáta

                        // Spoj nové a existujúce merania
                        const combined = [...newlyFetched, ...existing]

                        // Odstráň duplikáty pomocou Map (efektívnejšie pre veľké polia)
                        const uniqueMeasurementsMap = new Map()
                        combined.forEach(m => {
                            if (!uniqueMeasurementsMap.has(m._id)) {
                                uniqueMeasurementsMap.set(m._id, m)
                            }
                        })
                        const uniqueMeasurements = Array.from(uniqueMeasurementsMap.values())

                        // Zoradenie podľa času zostupne
                        uniqueMeasurements.sort(
                            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                        )

                        // Ulož zlúčené, unikátne a zoradené merania
                        existingMeasurements[type] = uniqueMeasurements
                    }
                })

                // Aktualizuj lastChange len ak sa niečo zmenilo
                if (changed) {
                    existingMeasurements.lastChange = new Date().toISOString()
                }
            })
            .addCase(fetchMeasurementsForFlower.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(fetchLatestMeasurements.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLatestMeasurements.fulfilled, (state, action) => {
                state.loading = false
                const flowerId = action.meta.arg.flowerId
                if (!state.measurements[flowerId]) {
                    state.measurements[flowerId] = {
                        water: [],
                        temperature: [],
                        light: [],
                        humidity: [],
                        battery: [],
                        lastChange: new Date().toISOString(),
                    }
                }

                // Pridáme nové merania na začiatok poľa a aktualizujeme lastChange
                let changed = false
                if (action.payload.water) {
                    state.measurements[flowerId].water.unshift(action.payload.water)
                    changed = true
                }
                if (action.payload.humidity) {
                    state.measurements[flowerId].humidity.unshift(action.payload.humidity)
                    changed = true
                }
                if (action.payload.light) {
                    state.measurements[flowerId].light.unshift(action.payload.light)
                    changed = true
                }
                if (action.payload.temperature) {
                    state.measurements[flowerId].temperature.unshift(action.payload.temperature)
                    changed = true
                }
                if (action.payload.battery) {
                    state.measurements[flowerId].battery.unshift(action.payload.battery)
                    changed = true
                }

                if (changed) {
                    state.measurements[flowerId].lastChange = new Date().toISOString()
                }
            })
            .addCase(fetchLatestMeasurements.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Chyba pri načítaní meraní'
            })
    },
})

export const {
    clearMeasurements,
    startWebSocketConnection,
    stopWebSocketConnection,
    setMeasurements,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    setActiveWebSocketFlowerId,
    clearActiveWebSocketFlowerId,
    setWebSocketStatus,
} = measurementsSlice.actions

export const initializeWebSocket = (dispatch: AppDispatch) => {
    webSocketService.setDispatch(dispatch)
}

export default measurementsSlice.reducer
