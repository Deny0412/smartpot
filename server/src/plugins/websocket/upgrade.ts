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
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '')
      const userId = (decoded as any).user_id

      const flowerId = path.split('/').pop()
      if (!flowerId) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
        socket.destroy()
        return
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const authenticatedWs = Object.assign(ws, {
          id: Math.random().toString(36).substring(7),
          userId,
          flowerId,
        }) as AuthenticatedWebSocket

        console.log(`Nové WebSocket pripojenie pre kvetinu ${flowerId} od používateľa ${userId}`)
        wss.emit('connection', authenticatedWs, request)
      })
    } catch (error) {
      console.error('Chyba pri overovaní tokenu:', error)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
    }
  } else {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
    socket.destroy()
  }
}
