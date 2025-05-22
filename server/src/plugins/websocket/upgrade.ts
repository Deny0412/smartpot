import { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import { AuthenticatedWebSocket } from './userConnections'

export function handleUpgrade(request: IncomingMessage, socket: any, head: Buffer, wss: WebSocketServer) {
  const url = new URL(request.url || '', `http://${request.headers.host}`)
  const path = url.pathname

  if (path.startsWith('/ws/measurements/')) {
    const token = url.searchParams.get('token')
    if (!token) {
      console.error('[WEBSOCKET] Missing token in WebSocket upgrade request')
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any
      console.log('[WEBSOCKET] Decoded token:', decoded)

      if (!decoded.user || !decoded.user.id) {
        console.error('[WEBSOCKET] Invalid token structure - missing user.id:', decoded)
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      const userId = decoded.user.id
      const flowerId = path.split('/').pop()

      if (!flowerId) {
        console.error('[WEBSOCKET] Missing flower ID in path:', path)
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
        socket.destroy()
        return
      }

      console.log(`[WEBSOCKET] Processing WebSocket upgrade for user ${userId} and flower ${flowerId}`)

      wss.handleUpgrade(request, socket, head, (ws) => {
        const authenticatedWs = Object.assign(ws, {
          id: Math.random().toString(36).substring(7),
          userId,
          flowerId,
        }) as AuthenticatedWebSocket

        console.log(`[WEBSOCKET] New WebSocket connection for flower ${flowerId} from user ${userId}`)
        wss.emit('connection', authenticatedWs, request)
      })
    } catch (error) {
      console.error('[WEBSOCKET] Error verifying token:', error)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
    }
  } else {
    console.error('[WEBSOCKET] Invalid WebSocket path:', path)
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
    socket.destroy()
  }
}
