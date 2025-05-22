import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import i18next from 'i18next'
import { MeasurementType, MeasurementValue } from '../../types/flowerTypes'
import { api } from '../services/api'
import { getMeasurementsForFlower } from '../services/measurmentApi'
import { AppDispatch, RootState } from '../store/store'

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
    webSocketStatus: WebSocketConnectionStatus
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
    webSocketStatus: 'idle',
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
    private dispatch: AppDispatch | null = null
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

        
        this.token = localStorage.getItem('token')
        if (!this.token) {
            console.error(i18next.t('flower_detail.console.token_not_available'))
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            return
        }

        // Validate token format
        try {
            const tokenParts = this.token.split('.')
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format')
            }
            const payload = JSON.parse(atob(tokenParts[1]))

            if (!payload.user || !payload.user.id) {
                throw new Error('Invalid token structure - missing user.id')
            }
        } catch (error) {
            console.error('Invalid token:', error)
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            return
        }

        // Update WebSocket URL construction
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'
        const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/measurements/${flowerId}?token=${encodeURIComponent(
            this.token,
        )}`

        try {
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log(i18next.t('flower_detail.console.websocket_open_for_flower', { flowerId: this.flowerId }))
                this.reconnectAttempts = 0
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connected'))
                    this.dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(this.flowerId!))
                }
            }

            this.ws.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)
                    console.log('[WEBSOCKET] Message received:', message)

                    if (!this.dispatch || !this.flowerId) {
                        console.error('[WEBSOCKET] No dispatch or flowerId available')
                        return
                    }

                    switch (message.type) {
                        case 'connection':
                            console.log('[WEBSOCKET] Connection established')
                            break
                        case 'measurement_inserted':
                            console.log('[WEBSOCKET] New measurement received:', message.data)
                            if (
                                !message.data.type ||
                                !['water', 'temperature', 'light', 'humidity', 'battery'].includes(message.data.type)
                            ) {
                                console.error('[WEBSOCKET] Invalid measurement type:', message.data.type)
                                break
                            }

                            this.dispatch(
                                measurementsSlice.actions.addMeasurement({
                                    flowerId: this.flowerId,
                                    measurement: message.data,
                                }),
                            )
                            break
                        case 'measurement_updated':
                            console.log('[WEBSOCKET] Measurement updated:', message.data)
                            this.dispatch(
                                measurementsSlice.actions.updateMeasurement({
                                    flowerId: this.flowerId,
                                    measurement: message.data,
                                }),
                            )
                            break
                        case 'measurement_deleted':
                            console.log('[WEBSOCKET] Measurement deleted:', message.data)
                            this.dispatch(
                                measurementsSlice.actions.removeMeasurement({
                                    flowerId: this.flowerId,
                                    type: message.data.type,
                                    measurementId: message.data.measurement_id,
                                }),
                            )
                            break
                        case 'error':
                            console.error('[WEBSOCKET] Error message:', message.message)
                            break
                        default:
                            console.log('[WEBSOCKET] Unknown message type:', message.type)
                    }
                } catch (error) {
                    console.error('[WEBSOCKET] Error processing message:', error)
                }
            }

            this.ws.onclose = event => {
                console.log('WebSocket closed:', event.code, event.reason)
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
            console.error('Error creating WebSocket:', error)
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
            console.log(`Reconnect attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`)

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
            }, this.reconnectTimeout * this.reconnectAttempts) // Increase timeout with each attempt
        } else {
            console.log('Max reconnect attempts reached')
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

// Thunks - najprv definované ako lokálne konštanty
const startWebSocketConnectionThunk = createAsyncThunk(
    'measurements/startWebSocketConnection',
    async (flowerId: string, { dispatch, getState }) => {
        const state = getState() as RootState
        const measurementsState = state.measurements

        if (
            measurementsState.activeWebSocketFlowerId !== flowerId ||
            ['idle', 'disconnected', 'error', 'closing'].includes(measurementsState.webSocketStatus)
        ) {
            if (
                measurementsState.activeWebSocketFlowerId &&
                measurementsState.activeWebSocketFlowerId !== flowerId &&
                !['idle', 'disconnected', 'error', 'closing'].includes(measurementsState.webSocketStatus)
            ) {
                console.log(
                    i18next.t('flower_detail.console.websocket_switching_flower', {
                        oldFlowerId: measurementsState.activeWebSocketFlowerId,
                        newFlowerId: flowerId,
                    }),
                )
                webSocketService.prepareForIntentionalDisconnect()
                webSocketService.disconnect()
            }

            dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(flowerId))
            dispatch(measurementsSlice.actions.setWebSocketStatus('connecting'))
            webSocketService.connect(flowerId)
        } else if (
            measurementsState.activeWebSocketFlowerId === flowerId &&
            measurementsState.webSocketStatus === 'connected'
        ) {
            console.log(i18next.t('flower_detail.console.websocket_already_connected_to_flower', { flowerId }))
        }
    },
)

const stopWebSocketConnectionThunk = createAsyncThunk(
    'measurements/stopWebSocketConnection',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState
        const measurementsState = state.measurements

        if (
            measurementsState.activeWebSocketFlowerId &&
            measurementsState.webSocketStatus !== 'idle' &&
            measurementsState.webSocketStatus !== 'closing'
        ) {
            console.log(
                i18next.t('flower_detail.console.websocket_stopping_connection_for_flower', {
                    flowerId: measurementsState.activeWebSocketFlowerId,
                }),
            )
            dispatch(measurementsSlice.actions.setWebSocketStatus('closing'))
            webSocketService.prepareForIntentionalDisconnect()
            webSocketService.disconnect()
        } else {
            console.log(
                i18next.t('flower_detail.console.websocket_stop_called_on_inactive', {
                    status: measurementsState.webSocketStatus,
                }),
            )
            dispatch(measurementsSlice.actions.setActiveWebSocketFlowerId(null))
            dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
        }
    },
)

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
            
            const formatDate = (date: Date) => {
                return date.toISOString().split('T')[0]
            }

            
            const fromDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 24 * 60 * 60 * 1000)
            const toDate = dateTo ? new Date(dateTo) : new Date()

            const formattedDateFrom = formatDate(fromDate)
            const formattedDateTo = formatDate(toDate)

          

            const types = ['water', 'humidity', 'temperature', 'light', 'battery'] as const
            const results = await Promise.all(
                types.map(async type => {
                    try {
                        return await getMeasurementsForFlower(
                            flowerId,
                            householdId,
                            formattedDateFrom,
                            formattedDateTo,
                            type,
                        )
                    } catch (error) {
                        console.error(`Error fetching ${type} measurements:`, error)
                        return { data: [] }
                    }
                }),
            )

            const measurementsByType = {
                water: [],
                temperature: [],
                light: [],
                humidity: [],
                battery: [],
            } as MeasurementsByType

            results.forEach((result, index) => {
                if (result.data?.length > 0) {
                    measurementsByType[types[index]] = result.data
                }
            })


            return {
                flowerId,
                measurements: measurementsByType,
            }
        } catch (error) {
            console.error('Error in fetchMeasurementsForFlower:', error)
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní meraní')
        }
    },
)

export const fetchLatestMeasurements = createAsyncThunk(
    'measurements/fetchLatest',
    async ({ flowerId, householdId }: { flowerId: string; householdId: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/flower/latest-history', {
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
            state.activeWebSocketFlowerId = null
            state.webSocketStatus = 'idle'
            state.error = null
            state.loading = false
            state.lastChange = null
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

            // Rýchla validácia typu
            if (
                !measurement.type ||
                !['water', 'temperature', 'light', 'humidity', 'battery'].includes(measurement.type)
            ) {
                return
            }

            const measurementType = measurement.type as keyof MeasurementsByType

            // Inicializácia stavu ak neexistuje
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

            // Rýchla kontrola duplicity pomocou Set
            if (measurements.some(m => m._id === measurement._id)) {
                return
            }

            // Pridanie merania na začiatok poľa
            measurements.unshift(measurement)

            // Obmedzenie veľkosti poľa
            if (measurements.length > 1000) {
                measurements.length = 1000
            }

            // Aktualizácia časovej pečiatky
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
    setMeasurements,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    setActiveWebSocketFlowerId,
    clearActiveWebSocketFlowerId,
    setWebSocketStatus,
} = measurementsSlice.actions

// Add new synchronous action for cleanup
export const cleanupWebSocket = () => {
    webSocketService.prepareForIntentionalDisconnect()
    webSocketService.disconnect()
    return { type: 'measurements/cleanupWebSocket' }
}

export const initializeWebSocket = (dispatch: AppDispatch) => {
    webSocketService.setDispatch(dispatch)
}

export default measurementsSlice.reducer

// Explicitný export thunkov s novými názvami konštánt
export {
    startWebSocketConnectionThunk as startWebSocketConnection,
    stopWebSocketConnectionThunk as stopWebSocketConnection,
}
