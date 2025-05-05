import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MeasurementType, MeasurementValue } from '../../types/flowerTypes'
import { getMeasurementsForFlower } from '../services/measurmentApi'

// Pridáme konštanty pre WebSocket stavy
const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
} as const

interface MeasurementsState {
    measurements: {
        [key: string]: {
            water: MeasurementValue[]
            temperature: MeasurementValue[]
            light: MeasurementValue[]
            humidity: MeasurementValue[]
            battery: MeasurementValue[]
        }
    }
    loading: boolean
    error: string | null
    activeWebSocketFlowerId: string | null
    lastChange: {
        type: string
        operation: string
        value: number | null
        timestamp: string
    } | null
}

const initialState: MeasurementsState = {
    measurements: {},
    loading: false,
    error: null,
    activeWebSocketFlowerId: null,
    lastChange: null,
}

// WebSocket service
class WebSocketService {
    private socket: WebSocket | null = null
    private flowerId: string | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectTimeout = 3000 // 3 sekundy
    private dispatch: any
    private isConnecting = false
    private reconnectTimer: NodeJS.Timeout | null = null
    private heartbeatInterval: NodeJS.Timeout | null = null
    private connectionCheckInterval: NodeJS.Timeout | null = null
    private lastHeartbeatResponse: number = 0
    private isAuthenticated = false

    private getSocketState(): number | null {
        return this.socket?.readyState ?? null
    }

    private startConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval)
        }

        this.connectionCheckInterval = setInterval(() => {
            const now = Date.now()
            // Ak sme nedostali heartbeat odpoveď za posledných 45 sekúnd, znovu sa pripojíme
            if (now - this.lastHeartbeatResponse > 45000) {
                if (this.flowerId) {
                    this.connect(this.flowerId)
                }
            }
        }, 5000) // Kontrola každých 5 sekúnd
    }

    private stopConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval)
            this.connectionCheckInterval = null
        }
    }

    setDispatch(dispatch: any) {
        this.dispatch = dispatch
    }

    connect(flowerId: string) {
        if (this.socket && this.flowerId === flowerId) {
            console.log(`[WebSocket] Kvetina ${flowerId} už je pripojená`)
            return // Už sme pripojení k tomuto kvetu
        }

        if (this.isConnecting) {
            console.log(`[WebSocket] Kvetina ${flowerId} sa už pripája`)
            return // Už sa pripájame
        }

        this.disconnect()
        this.flowerId = flowerId
        this.isConnecting = true
        this.lastHeartbeatResponse = Date.now()
        this.isAuthenticated = false

        console.log(`[WebSocket] Pripájam kvetinu ${flowerId}`)

        try {
            // Pripojenie na WebSocket server
            this.socket = new WebSocket(`ws://localhost:3001/ws/measurements/${flowerId}`)

            this.socket.onopen = () => {
                this.reconnectAttempts = 0
                this.isConnecting = false
                this.lastHeartbeatResponse = Date.now()
                this.isAuthenticated = true

                console.log(`[WebSocket] Kvetina ${flowerId} úspešne pripojená`)

                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer)
                    this.reconnectTimer = null
                }

                // Spustíme kontrolu pripojenia
                this.startConnectionCheck()

                // Nastavenie heartbeat
                if (this.heartbeatInterval) {
                    clearInterval(this.heartbeatInterval)
                }
                this.heartbeatInterval = setInterval(() => {
                    if (this.socket?.readyState === WebSocketStates.OPEN) {
                        this.socket.send(JSON.stringify({ type: 'heartbeat' }))
                    } else {
                        // Ak nie je pripojenie v stave OPEN, pokúsime sa znovu pripojiť
                        if (this.flowerId) {
                            this.connect(this.flowerId)
                        }
                    }
                }, 30000) // Každých 30 sekúnd

                // Odoslanie počiatočnej správy
                if (this.socket?.readyState === WebSocketStates.OPEN) {
                    this.socket.send(JSON.stringify({ type: 'init', flowerId }))
                }
            }

            this.socket.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)

                    // Ignorujeme heartbeat správy
                    if (message.type === 'heartbeat') {
                        this.lastHeartbeatResponse = Date.now()
                        return
                    }

                    // Ignorujeme správy ak nie sme autentizovaní
                    if (!this.isAuthenticated) {
                        return
                    }

                    if (!message.data) {
                        return
                    }

                    const { type, operation, data } = message

                    // Pridáme type do dát ak chýba
                    const measurementData = {
                        ...data,
                        type: type || data.type,
                        _id: data._id,
                        value: Number(data.value),
                        createdAt: data.createdAt || new Date().toISOString(),
                    }

                    // Skontrolujeme, či máme všetky potrebné dáta
                    if (!measurementData._id || !measurementData.type || measurementData.value === undefined) {
                        return
                    }

                    // Skontrolujeme, či máme dispatch funkciu
                    if (!this.dispatch) {
                        return
                    }

                    switch (operation) {
                        case 'insert':
                            this.dispatch(
                                addMeasurement({
                                    flowerId: this.flowerId!,
                                    measurement: measurementData,
                                }),
                            )
                            break
                        case 'update':
                            this.dispatch(
                                updateMeasurement({
                                    flowerId: this.flowerId!,
                                    measurement: measurementData,
                                }),
                            )
                            break
                        case 'delete':
                            if (data._id) {
                                this.dispatch(
                                    removeMeasurement({
                                        flowerId: this.flowerId!,
                                        type: type || data.type,
                                        measurementId: data._id,
                                    }),
                                )
                            }
                            break
                    }
                } catch (error) {
                    // Ignorujeme chyby pri spracovaní správy
                }
            }

            this.socket.onclose = event => {
                this.socket = null
                this.isConnecting = false
                this.isAuthenticated = false

                // Vyčistenie intervalov
                if (this.heartbeatInterval) {
                    clearInterval(this.heartbeatInterval)
                    this.heartbeatInterval = null
                }
                this.stopConnectionCheck()

                // Pokus o opätovné pripojenie len ak nebolo zatvorené normálne
                if (event.code !== 1000) {
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++

                        if (this.reconnectTimer) {
                            clearTimeout(this.reconnectTimer)
                        }

                        this.reconnectTimer = setTimeout(() => {
                            if (this.flowerId) {
                                this.connect(this.flowerId)
                            }
                        }, this.reconnectTimeout * this.reconnectAttempts)
                    }
                }
            }

            this.socket.onerror = () => {
                this.isConnecting = false
                this.isAuthenticated = false
            }
        } catch (error) {
            this.isConnecting = false
            this.isAuthenticated = false
        }
    }

    disconnect() {
        if (this.socket) {
            console.log(`[WebSocket] Odpájam kvetinu ${this.flowerId}`)
            this.socket.close(1000, 'Normal closure')
            this.socket = null
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
        this.stopConnectionCheck()
        this.flowerId = null
        this.reconnectAttempts = 0
        this.isConnecting = false
        this.isAuthenticated = false
    }
}

const websocketService = new WebSocketService()

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

            // Rozdelenie meraní podľa typu
            const measurementsByType = response.data.reduce(
                (acc: { [key in MeasurementType]: MeasurementValue[] }, measurement) => {
                    if (!acc[measurement.type]) {
                        acc[measurement.type] = []
                    }
                    acc[measurement.type].push(measurement)
                    return acc
                },
                {
                    water: [],
                    temperature: [],
                    light: [],
                    humidity: [],
                    battery: [],
                },
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
                    },
                }
            }
            return rejectWithValue(error instanceof Error ? error.message : 'Chyba pri načítaní meraní')
        }
    },
)

export const measurementsSlice = createSlice({
    name: 'measurements',
    initialState,
    reducers: {
        clearMeasurements: state => {
            state.measurements = {}
            state.lastChange = null
        },
        startWebSocketConnection: (state, action: PayloadAction<string>) => {
            if (state.activeWebSocketFlowerId !== action.payload) {
                if (state.activeWebSocketFlowerId) {
                    websocketService.disconnect()
                }
                state.activeWebSocketFlowerId = action.payload
                websocketService.connect(action.payload)
            }
        },
        stopWebSocketConnection: state => {
            if (state.activeWebSocketFlowerId) {
                websocketService.disconnect()
                state.activeWebSocketFlowerId = null
            }
        },
        addMeasurement: (state, action: PayloadAction<{ flowerId: string; measurement: MeasurementValue }>) => {
            const { flowerId, measurement } = action.payload

            if (!state.measurements[flowerId]) {
                state.measurements[flowerId] = {
                    water: [],
                    temperature: [],
                    light: [],
                    humidity: [],
                    battery: [],
                }
            }
            // Pridáme meranie na začiatok poľa
            state.measurements[flowerId][measurement.type].unshift(measurement)
            // Obmedzíme počet meraní na 1000
            if (state.measurements[flowerId][measurement.type].length > 1000) {
                state.measurements[flowerId][measurement.type] = state.measurements[flowerId][measurement.type].slice(
                    0,
                    1000,
                )
            }
            // Aktualizujeme poslednú zmenu
            state.lastChange = {
                type: measurement.type,
                operation: 'insert',
                value: typeof measurement.value === 'string' ? parseFloat(measurement.value) : measurement.value,
                timestamp: new Date().toISOString(),
            }
        },
        updateMeasurement: (state, action: PayloadAction<{ flowerId: string; measurement: MeasurementValue }>) => {
            const { flowerId, measurement } = action.payload

            if (state.measurements[flowerId] && state.measurements[flowerId][measurement.type]) {
                const index = state.measurements[flowerId][measurement.type].findIndex(m => m._id === measurement._id)
                if (index !== -1) {
                    // Aktualizujeme meranie a presunieme ho na začiatok poľa
                    const updatedMeasurement = {
                        ...state.measurements[flowerId][measurement.type][index],
                        ...measurement,
                    }
                    state.measurements[flowerId][measurement.type].splice(index, 1)
                    state.measurements[flowerId][measurement.type].unshift(updatedMeasurement)
                    // Aktualizujeme poslednú zmenu
                    state.lastChange = {
                        type: measurement.type,
                        operation: 'update',
                        value:
                            typeof measurement.value === 'string' ? parseFloat(measurement.value) : measurement.value,
                        timestamp: new Date().toISOString(),
                    }
                }
            }
        },
        removeMeasurement: (
            state,
            action: PayloadAction<{ flowerId: string; type: MeasurementType; measurementId: string }>,
        ) => {
            const { flowerId, type, measurementId } = action.payload
            if (state.measurements[flowerId] && state.measurements[flowerId][type]) {
                const measurement = state.measurements[flowerId][type].find(m => m._id === measurementId)
                if (measurement) {
                    state.measurements[flowerId][type] = state.measurements[flowerId][type].filter(
                        m => m._id !== measurementId,
                    )
                    // Aktualizujeme poslednú zmenu
                    state.lastChange = {
                        type,
                        operation: 'delete',
                        value:
                            typeof measurement.value === 'string' ? parseFloat(measurement.value) : measurement.value,
                        timestamp: new Date().toISOString(),
                    }
                }
            }
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
                // Zoradíme merania podľa času zostupne (od najnovších po najstaršie)
                const sortedMeasurements = {
                    water: action.payload.measurements.water.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                    temperature: action.payload.measurements.temperature.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                    light: action.payload.measurements.light.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                    humidity: action.payload.measurements.humidity.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                    battery: action.payload.measurements.battery.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    ),
                }
                state.measurements[action.payload.flowerId] = sortedMeasurements
            })
            .addCase(fetchMeasurementsForFlower.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const {
    clearMeasurements,
    startWebSocketConnection,
    stopWebSocketConnection,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
} = measurementsSlice.actions

export const initializeWebSocket = (dispatch: any) => {
    websocketService.setDispatch(dispatch)
}

export default measurementsSlice.reducer
