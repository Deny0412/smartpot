import { measurementsSlice } from '../slices/measurementsSlice'
import { AppDispatch } from '../store/store'

class WebSocketService {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectTimeout = 3000
    private dispatch: AppDispatch | null = null
    private isIntentionalDisconnect = false
    private permanentDisconnect = false
    private token: string | null = null

    constructor() {
        this.token = localStorage.getItem('token')
    }

    setDispatch(dispatch: AppDispatch) {
        this.dispatch = dispatch
    }

    prepareForIntentionalDisconnect() {
        this.isIntentionalDisconnect = true
    }

    connect() {
        if (this.permanentDisconnect) {
            console.log('WebSocket is permanently disconnected, not reconnecting.')
            return
        }
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            console.log('WebSocket already connected or connecting')
            return
        }

        this.isIntentionalDisconnect = false
        this.permanentDisconnect = false

        this.token = localStorage.getItem('token')
        if (!this.token) {
            console.error('Token not available')
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('error'))
            }
            return
        }

        
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

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'
        const wsUrl = `${baseUrl.replace('http', 'ws')}/ws?token=${encodeURIComponent(this.token)}`

        try {
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log('WebSocket connected')
                this.reconnectAttempts = 0
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connected'))
                }
            }

            this.ws.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)
                    console.log('[WEBSOCKET] Message received:', message)

                    if (!this.dispatch) {
                        console.error('[WEBSOCKET] No dispatch available')
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
                                    flowerId: message.data.flower_id,
                                    measurement: message.data,
                                }),
                            )
                            break
                        case 'measurement_updated':
                            console.log('[WEBSOCKET] Measurement updated:', message.data)
                            this.dispatch(
                                measurementsSlice.actions.updateMeasurement({
                                    flowerId: message.data.flower_id,
                                    measurement: message.data,
                                }),
                            )
                            break
                        case 'measurement_deleted':
                            console.log('[WEBSOCKET] Measurement deleted:', message.data)
                            this.dispatch(
                                measurementsSlice.actions.removeMeasurement({
                                    flowerId: message.data.flower_id,
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
                    }
                    this.isIntentionalDisconnect = false
                } else {
                    this.handleReconnect()
                }
                this.ws = null
            }

            this.ws.onerror = error => {
                console.error('WebSocket error:', error)
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
        if (this.isIntentionalDisconnect || this.permanentDisconnect) {
            return
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`Reconnect attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`)

            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('reconnecting'))
            }
            setTimeout(() => {
                if (this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('connecting'))
                    this.connect()
                }
            }, this.reconnectTimeout * this.reconnectAttempts)
        } else {
            console.log('Max reconnect attempts reached')
            this.permanentDisconnect = true
            if (this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('disconnected'))
            }
        }
    }

    sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        }
    }

    disconnect() {
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
                this.ws.close()
            } else {
                if (this.isIntentionalDisconnect && this.dispatch) {
                    this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                }
            }
            this.ws = null
        } else {
            if (this.isIntentionalDisconnect && this.dispatch) {
                this.dispatch(measurementsSlice.actions.setWebSocketStatus('idle'))
                this.isIntentionalDisconnect = false
            }
        }
    }
}

export const webSocketService = new WebSocketService()
