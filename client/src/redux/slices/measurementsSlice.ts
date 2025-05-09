import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MeasurementType, MeasurementValue } from '../../types/flowerTypes'
import { api } from '../services/api'
import { getMeasurementsForFlower } from '../services/measurmentApi'
import { AppDispatch } from '../store/store'

// Pridáme konštanty pre WebSocket stavy
const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
} as const

interface MeasurementsState {
    measurements: {
        [flowerId: string]: {
            [key in MeasurementType]: MeasurementValue[]
        }
    }
    loading: boolean
    error: string | null
    activeWebSocketFlowerId: string | null
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
    lastChange: null,
}

// WebSocket service
class WebSocketService {
    private socket: WebSocket | null = null
    private reconnectAttempts = 0
    private readonly maxReconnectAttempts = 5
    private readonly reconnectTimeout = 3000
    private isConnecting = false
    private lastHeartbeatResponse: number = Date.now()
    private heartbeatInterval: NodeJS.Timeout | null = null
    private connectionCheckInterval: NodeJS.Timeout | null = null
    private flowerId: string | null = null
    private dispatch: AppDispatch | null = null

    constructor() {
        this.handleReconnect = this.handleReconnect.bind(this)
        this.handleMessage = this.handleMessage.bind(this)
        this.sendHeartbeat = this.sendHeartbeat.bind(this)
        this.checkConnection = this.checkConnection.bind(this)
    }

    public setDispatch(dispatch: AppDispatch) {
        this.dispatch = dispatch
    }

    public connect(flowerId: string) {
        if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
            return
        }

        this.isConnecting = true
        this.flowerId = flowerId

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsHost = window.location.hostname + ':3001'

        try {
            console.log('Pripojujem sa na WebSocket:', `${wsProtocol}//${wsHost}/ws/measurements/${flowerId}`)
            this.socket = new WebSocket(`${wsProtocol}//${wsHost}/ws/measurements/${flowerId}`)

            this.socket.onopen = () => {
                console.log('WebSocket pripojenie úspešné')
                this.reconnectAttempts = 0
                this.isConnecting = false
                this.lastHeartbeatResponse = Date.now()

                // Spustenie kontroly pripojenia
                this.startConnectionCheck()

                // Spustenie heartbeat
                this.startHeartbeat()

                // Odoslanie init správy
                if (this.socket?.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({ type: 'init' }))
                }
            }

            this.socket.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)
                    console.log('Prijatá WebSocket správa:', message)
                    this.handleMessage(message)
                } catch (error) {
                    console.error('Chyba pri spracovaní správy:', error)
                }
            }

            this.socket.onclose = () => {
                console.log('WebSocket pripojenie zatvorené')
                this.cleanup()
                this.handleReconnect()
            }

            this.socket.onerror = error => {
                console.error('WebSocket chyba:', error)
                this.cleanup()
                this.handleReconnect()
            }
        } catch (error) {
            console.error('Chyba pri vytváraní WebSocket pripojenia:', error)
            this.isConnecting = false
            this.handleReconnect()
        }
    }

    private cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval)
            this.connectionCheckInterval = null
        }
        this.socket = null
        this.isConnecting = false
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`Pokus o opätovné pripojenie ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
            setTimeout(() => {
                if (this.flowerId && this.dispatch) {
                    this.connect(this.flowerId)
                }
            }, this.reconnectTimeout * this.reconnectAttempts)
        } else {
            console.error('Dosiahnutý maximálny počet pokusov o pripojenie')
        }
    }

    private startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }

        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'heartbeat' }))
            }
        }, 30000) // Každých 30 sekúnd
    }

    private startConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval)
        }

        this.connectionCheckInterval = setInterval(() => {
            const now = Date.now()
            if (now - this.lastHeartbeatResponse > 60000) {
                // 60 sekúnd bez odpovede
                console.log('WebSocket pripojenie neaktívne, pokus o opätovné pripojenie')
                this.cleanup()
                this.handleReconnect()
            }
        }, 10000) // Kontrola každých 10 sekúnd
    }

    private handleMessage(message: any) {
        if (!this.dispatch) {
            console.error('WebSocket: dispatch nie je nastavený')
            return
        }

        console.log('WebSocket: Prijatá správa:', JSON.stringify(message, null, 2))

        if (message.type === 'heartbeat') {
            this.lastHeartbeatResponse = Date.now()
            console.log('WebSocket: Prijatý heartbeat')
            return
        }

        if (message.type === 'init' && message.status === 'success') {
            console.log('WebSocket: Inicializácia úspešná')
            return
        }

        if (message.data) {
            console.log('WebSocket: Spracovávam dáta:', JSON.stringify(message.data, null, 2))

            const { flower_id, type, value, createdAt, _id } = message.data

            if (!flower_id || !type || value === undefined) {
                console.error('WebSocket: Neplatné dáta v správe:', message.data)
                return
            }

            const now = new Date().toISOString()

            // Pridanie merania do Redux store
            this.dispatch(
                addMeasurement({
                    flowerId: flower_id,
                    measurement: {
                        _id: _id,
                        flower_id: flower_id,
                        type: type as MeasurementType,
                        value: value,
                        createdAt: createdAt || now,
                        updatedAt: now,
                    },
                }),
            )

            // Aktualizácia lastChange
            this.dispatch(
                setLastChange({
                    flowerId: flower_id,
                    type: type as MeasurementType,
                    timestamp: now,
                }),
            )
        }
    }

    public disconnect() {
        this.cleanup()
        if (this.socket) {
            this.socket.close()
        }
    }

    private sendHeartbeat() {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'heartbeat' }))
        }
    }

    private checkConnection() {
        const now = Date.now()
        if (now - this.lastHeartbeatResponse > 60000) {
            // 60 sekúnd bez odpovede
            console.log('WebSocket pripojenie neaktívne, pokus o opätovné pripojenie')
            this.cleanup()
            this.handleReconnect()
        }
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
            console.log('Načítavam merania pre kvetinu:', { flowerId, householdId, dateFrom, dateTo })
            const response = await getMeasurementsForFlower(flowerId, householdId, dateFrom, dateTo)
            console.log('Prijaté merania:', response.data)

            // Rozdelenie meraní podľa typu
            const measurementsByType = response.data.reduce(
                (acc: { [key in MeasurementType]: MeasurementValue[] }, measurement) => {
                    if (!acc[measurement.type]) {
                        acc[measurement.type] = []
                    }
                    // Zoradenie meraní podľa času zostupne
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
                },
            )

            console.log('Rozdelené merania podľa typu:', measurementsByType)

            return {
                flowerId,
                measurements: measurementsByType,
            }
        } catch (error) {
            console.error('Chyba pri načítaní meraní:', error)
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
            // Ak je to 404, vrátime prázdne merania
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
                flowerId,
                type: measurement.type,
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
                        flowerId,
                        type: measurement.type,
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
                        flowerId,
                        type,
                        timestamp: new Date().toISOString(),
                    }
                }
            }
        },
        setActiveWebSocketFlowerId: (state, action: PayloadAction<string | null>) => {
            state.activeWebSocketFlowerId = action.payload
        },
        setLastChange: (
            state,
            action: PayloadAction<{ flowerId: string; type: MeasurementType; timestamp: string }>,
        ) => {
            state.lastChange = action.payload
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
                        humidity: [],
                        light: [],
                        temperature: [],
                        battery: [],
                    }
                }

                // Pridáme nové merania na začiatok poľa
                if (action.payload.water) {
                    state.measurements[flowerId].water = [action.payload.water]
                }
                if (action.payload.humidity) {
                    state.measurements[flowerId].humidity = [action.payload.humidity]
                }
                if (action.payload.light) {
                    state.measurements[flowerId].light = [action.payload.light]
                }
                if (action.payload.temperature) {
                    state.measurements[flowerId].temperature = [action.payload.temperature]
                }
                if (action.payload.battery) {
                    state.measurements[flowerId].battery = [action.payload.battery]
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
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    setActiveWebSocketFlowerId,
    setLastChange,
} = measurementsSlice.actions

export const initializeWebSocket = (dispatch: AppDispatch) => {
    websocketService.setDispatch(dispatch)
}

export { websocketService }
export default measurementsSlice.reducer
